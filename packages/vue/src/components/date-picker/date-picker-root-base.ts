import type { Align, Side } from "@fragiola/primitives/positioning";
import { computed, defineComponent, type PropType, provide, ref } from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import {
    type OverlayRootProps,
    overlayRootEmits,
    overlayRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { calendarOptionProps } from "../calendar/calendar-root-base.ts";
import type {
    CalendarMode,
    CalendarOptions,
    CalendarValue,
} from "../calendar/calendar-value.ts";
import { PickerBindingKey } from "../calendar/picker-binding-context.ts";
import {
    type DatePickerComponent,
    DatePickerKey,
} from "./date-picker-context.ts";

/** The props both picker roots share (each adds its own typed value). */
export interface DatePickerRootSharedProps
    extends OverlayRootProps,
        CalendarOptions {}

export const datePickerRootProps = {
    ...overlayRootProps,
    value: { type: Object as PropType<CalendarValue>, default: undefined },
    defaultValue: { type: Object as PropType<CalendarValue>, default: null },
    ...calendarOptionProps,
};

/** `v-model:open`, `v-model:value`, and the change events with their reason. */
export const datePickerRootEmits = {
    ...overlayRootEmits,
    "update:value": (_value: CalendarValue) => true,
    valueChange: (_value: CalendarValue, _details: ChangeDetails) => true,
};

/**
 * The state of a DatePicker or a DateRangePicker (spec/calendar.md): the open state of its popup
 * and the value the calendar inside binds to. Renders no element.
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
        setup(props, { emit, slots }) {
            const root = useOverlayRoot(props, emit);
            const value = useControllable<CalendarValue, ChangeDetails>(
                () => props.value,
                props.defaultValue ?? null,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            provide(DatePickerKey, {
                ...root,
                component,
                placed: ref<{ side: Side; align: Align }>({
                    side: "bottom",
                    align: "start",
                }),
            });
            provide(PickerBindingKey, {
                mode,
                value: computed(() => value.value.value),
                choose(next) {
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
            });
            return () => slots.default?.();
        },
    });
}
