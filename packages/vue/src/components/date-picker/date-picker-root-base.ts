import { toIsoDate } from "@fragiola/primitives/date";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    computed,
    defineComponent,
    Fragment,
    h,
    type PropType,
    provide,
    ref,
    shallowRef,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import {
    type OverlayRootProps,
    overlayRootEmits,
    overlayRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { calendarOptionProps } from "../calendar/calendar-root-base.ts";
import {
    type CalendarMode,
    type CalendarOptions,
    type CalendarValue,
    isRange,
} from "../calendar/calendar-value.ts";
import { PickerBindingKey } from "../calendar/picker-binding-context.ts";
import {
    type DatePickerComponent,
    DatePickerKey,
} from "./date-picker-context.ts";

/** The form props both picker roots take (spec/calendar.md, "Forms"). */
export interface DatePickerFormProps {
    /** The hidden input's name (a Field's `name` wins); without one, no input is rendered. */
    name?: string;
    required?: boolean;
    disabled?: boolean;
    /** The popup still opens; its calendar can be browsed, no date chosen. */
    readOnly?: boolean;
}

/** The props both picker roots share (each adds its own typed value). */
export interface DatePickerRootSharedProps
    extends OverlayRootProps,
        CalendarOptions,
        DatePickerFormProps {}

export const datePickerRootProps = {
    ...overlayRootProps,
    value: { type: Object as PropType<CalendarValue>, default: undefined },
    defaultValue: { type: Object as PropType<CalendarValue>, default: null },
    ...calendarOptionProps,
    name: { type: String, default: undefined },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
};

/** `v-model:open`, `v-model:value`, and the change events with their reason. */
export const datePickerRootEmits = {
    ...overlayRootEmits,
    "update:value": (_value: CalendarValue) => true,
    valueChange: (_value: CalendarValue, _details: ChangeDetails) => true,
};

/** What the hidden input submits: `2026-11-24`, a range `2026-11-25/2026-11-27`, or nothing. */
function isoValue(value: CalendarValue): string {
    if (value === null) {
        return "";
    }
    return isRange(value)
        ? `${toIsoDate(value.start)}/${toIsoDate(value.end)}`
        : toIsoDate(value);
}

/**
 * The state of a DatePicker or a DateRangePicker (spec/calendar.md): the open state of its popup
 * and the value the calendar inside binds to; renders, after its children, the visually hidden
 * input a form submits, while it has a name.
 */
export function defineDatePickerRoot(
    name: string,
    component: DatePickerComponent,
    mode: CalendarMode,
) {
    return defineComponent({
        name,
        props: datePickerRootProps,
        emits: datePickerRootEmits,
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            // a template ref on the Root: `close()` and `unmount()` (spec/README.md, "Lifecycle")
            expose(root.actions);
            const value = useControllable<CalendarValue, ChangeDetails>(
                () => props.value,
                props.defaultValue ?? null,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const current = computed(() => value.value.value);
            const input = shallowRef<HTMLInputElement | null>(null);
            const field = useFieldControl({
                // the trigger's rendered id: the consumer's, else the generated one
                id: () => root.trigger.value?.id || root.triggerId,
                labelable: true,
                // a press on the label focuses the trigger; its click would open the popup
                labelFocuses: true,
                value: () => current.value,
                filled: () => current.value !== null,
                input: () => input.value,
                focusTarget: () => root.trigger.value,
            });
            const disabled = () => props.disabled || field.disabled();
            const readOnly = () => props.readOnly;
            const inputName = () => field.name() ?? props.name;
            provide(DatePickerKey, {
                ...root,
                component,
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "start",
                }),
                field,
                disabled,
                readOnly,
                required: () => props.required,
            });
            provide(PickerBindingKey, {
                mode,
                open: () => root.open.value,
                value: current,
                choose(next) {
                    if (readOnly()) {
                        return;
                    }
                    value.set(next, { reason: "item-press" });
                    root.setOpen(false, "item-press");
                },
                options: () => ({
                    min: props.min,
                    max: props.max,
                    isDateUnavailable: props.isDateUnavailable,
                    locale: props.locale,
                    firstDayOfWeek: props.firstDayOfWeek,
                    visibleMonths: props.visibleMonths,
                }),
                readOnly,
            });

            // a form reset returns it to its default; a failed validation focuses the trigger
            watch(
                input,
                (element, _, onCleanup) => {
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                const initial = props.defaultValue ?? null;
                                field.reset();
                                value.set(initial, { reason: "none" });
                                element.value = isoValue(
                                    value.value.value ?? null,
                                );
                            },
                            invalid: () => root.trigger.value,
                        }),
                    );
                },
                { flush: "post" },
            );
            return () => {
                const submitted = inputName();
                return h(Fragment, [
                    slots.default?.(),
                    submitted === undefined
                        ? null
                        : h("input", {
                              ref: (element: unknown) => {
                                  input.value =
                                      element as HTMLInputElement | null;
                              },
                              "aria-hidden": "true",
                              tabindex: -1,
                              name: submitted,
                              value: isoValue(current.value),
                              required: props.required,
                              disabled: disabled(),
                              style: VISUALLY_HIDDEN_INPUT_STYLE,
                              "data-primitives-part": `${component}-input`,
                          }),
                ]);
            };
        },
    });
}
