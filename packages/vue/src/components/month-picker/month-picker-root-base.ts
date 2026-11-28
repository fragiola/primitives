import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    type PlainYear,
    type PlainYearMonth,
    toIsoYear,
    toIsoYearMonth,
} from "@fragiola/primitives/month-year";
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
import {
    DatePickerKey,
    type PickerComponent,
} from "../date-picker/date-picker-context.ts";
import { MonthCalendarBindingKey } from "../month-calendar/month-calendar-binding-context.ts";
import { monthCalendarOptionProps } from "../month-calendar/month-calendar-root-base.ts";
import {
    isItemRange,
    type MonthCalendarItem,
    type MonthCalendarKind,
    type MonthCalendarMode,
    type MonthCalendarValue,
} from "../month-calendar/month-calendar-value.ts";

/** The props every month and year picker root shares (each adds its own typed value). */
export interface MonthPickerRootSharedProps extends OverlayRootProps {
    /** A BCP 47 tag, passed to the bound calendar. */
    locale?: string;
    /** Items per row, passed to the bound calendar (default 3). */
    columns?: number;
    /**
     * A calendar system (spec/calendar-systems.md), passed to the bound calendar: the values are
     * its months or years, and the form submits their first day's ISO date with the system
     * (`2026-10-23[u-ca=persian]`).
     */
    calendar?: CalendarSystem;
    /** The hidden input's name (a Field's `name` wins); without one, no input is rendered. */
    name?: string;
    /** A form submission needs a value. */
    required?: boolean;
    /** The trigger cannot open the popup, and the value is not submitted. */
    disabled?: boolean;
    /** The value cannot change: the popup opens, its calendar is read-only. */
    readOnly?: boolean;
}

export const monthPickerRootProps = {
    ...overlayRootProps,
    value: {
        type: Object as PropType<MonthCalendarValue>,
        default: undefined,
    },
    defaultValue: {
        type: Object as PropType<MonthCalendarValue>,
        default: null,
    },
    ...monthCalendarOptionProps,
    name: { type: String, default: undefined },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
};

/** `v-model:open`, `v-model:value`, and the change events with their reason. */
export const monthPickerRootEmits = {
    ...overlayRootEmits,
    "update:value": (_value: MonthCalendarValue) => true,
    valueChange: (_value: MonthCalendarValue, _details: ChangeDetails) => true,
};

/** An item's ISO text: `2026-11` or `2026`; a calendar system's (its hook) `2026-10-23[u-ca=persian]`. */
type IsoOf = (item: MonthCalendarItem) => string;

function isoOf(
    kind: MonthCalendarKind,
    calendar: CalendarSystem | undefined,
): IsoOf {
    if (calendar) {
        const units = calendar.units(kind);
        return (item) => units.iso(units.index(item));
    }
    return kind === "month"
        ? (item) => toIsoYearMonth(item as PlainYearMonth)
        : (item) => toIsoYear(item as PlainYear);
}

/**
 * What the form submits: `2026-11`, `2026`, a range as the ISO 8601 interval (`2026-03/2026-06`,
 * `2020/2024`), or empty with no value.
 */
function formValue(iso: IsoOf, value: MonthCalendarValue): string {
    if (value === null) {
        return "";
    }
    if (isItemRange(value)) {
        return `${iso(value.start)}/${iso(value.end)}`;
    }
    return iso(value);
}

/**
 * The state of a MonthPicker, MonthRangePicker, YearPicker or YearRangePicker
 * (spec/month-calendar.md): the DatePicker's (the open state of its popup, its form support, its
 * Field), with a month or year value the calendar inside binds to. It provides the DatePicker's
 * context, so the DatePicker's Trigger, Portal, Positioner and Popup are its parts.
 */
export function defineMonthPickerRoot(
    name: string,
    component: PickerComponent,
    kind: MonthCalendarKind,
    mode: MonthCalendarMode,
) {
    return defineComponent({
        name,
        props: monthPickerRootProps,
        emits: monthPickerRootEmits,
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);
            // a template ref on the Root: `close()` and `unmount()` (spec/README.md, "Lifecycle")
            expose(root.actions);
            const value = useControllable<MonthCalendarValue, ChangeDetails>(
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
            // whether the popup is a layer: its calendar takes the focus only then
            // (spec/calendar.md, "Focus")
            const layered = ref(false);
            provide(DatePickerKey, {
                layered,
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
            provide(MonthCalendarBindingKey, {
                kind,
                mode,
                open: () => root.open.value,
                layered: () => layered.value,
                focusOnMount: () => true,
                value: () => current.value,
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
                    isUnavailable: props.isUnavailable,
                    locale: props.locale,
                    columns: props.columns,
                    calendar: props.calendar,
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
                                element.value = formValue(
                                    isoOf(kind, props.calendar),
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
                              value: formValue(
                                  isoOf(kind, props.calendar),
                                  current.value,
                              ),
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
