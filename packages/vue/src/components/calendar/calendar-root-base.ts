import { type PlainDate, toIsoDate } from "@fragiola/primitives/date";
import { defineComponent, nextTick, type PropType, provide, watch } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type CalendarComponent, CalendarKey } from "./calendar-context.ts";
import type {
    CalendarMode,
    CalendarOptions,
    CalendarValue,
} from "./calendar-value.ts";
import { useCalendar } from "./use-calendar.ts";

export interface CalendarRootState {
    disabled: boolean;
    readOnly: boolean;
}

/** The props both calendar roots share (each adds its own typed value). */
export interface CalendarRootSharedProps extends CalendarOptions {
    disabled?: boolean;
    readOnly?: boolean;
}

/** The options both calendar roots and both picker roots take (spec/calendar.md, "API"). */
export const calendarOptionProps = {
    min: { type: Object as PropType<PlainDate | null>, default: undefined },
    max: { type: Object as PropType<PlainDate | null>, default: undefined },
    isDateUnavailable: {
        type: Function as PropType<(date: PlainDate) => boolean>,
        default: undefined,
    },
    locale: { type: String, default: undefined },
    firstDayOfWeek: { type: Number, default: undefined },
    visibleMonths: { type: Number, default: undefined },
};

export const calendarRootProps = {
    ...asProp,
    value: { type: Object as PropType<CalendarValue>, default: undefined },
    defaultValue: {
        type: Object as PropType<CalendarValue>,
        default: undefined,
    },
    ...calendarOptionProps,
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
};

/** `v-model:value`, and `@value-change="(value, details) => ..."` with the reason. */
export const calendarRootEmits = {
    "update:value": (_value: CalendarValue) => true,
    valueChange: (_value: CalendarValue, _details: ChangeDetails) => true,
};

/** The root element and state of a Calendar or a RangeCalendar (spec/calendar.md). */
export function defineCalendarRoot(
    name: string,
    component: CalendarComponent,
    mode: CalendarMode,
) {
    return defineComponent({
        name,
        inheritAttrs: false,
        props: calendarRootProps,
        emits: calendarRootEmits,
        setup(props, { attrs, slots, emit }) {
            const { context, opened } = useCalendar(
                component,
                mode,
                props,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            provide(CalendarKey, context);
            // reopened while its exit animation still ran, the same calendar takes the focus again
            watch(opened, (open) => {
                if (open) {
                    context.focusPending.current = true;
                    void nextTick().then(focusPendingCell);
                }
            });
            const focusPendingCell = () => {
                if (!context.focusPending.current) {
                    return;
                }
                const cell = context.cells.get(
                    toIsoDate(context.focusedDate.value),
                );
                if (cell) {
                    context.focusPending.current = false;
                    cell.focus({ preventScroll: true });
                }
            };
            // after a render while a focus is pending: the focused date's cell may have mounted
            // in it (a new month, a picker opening; AGENTS.md "Porting", 5); a cell that mounts
            // later takes the focus itself
            watch(
                () =>
                    [
                        context.focusedDate.value,
                        context.visibleStart.value,
                    ] as const,
                () => {
                    void nextTick().then(focusPendingCell);
                },
                { flush: "post", immediate: true },
            );
            return () => {
                const disabled = context.disabled();
                const readOnly = context.readOnly();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { disabled, readOnly },
                    {
                        "data-primitives-part": `${component}-root`,
                        ...stateAttributes({ disabled, readonly: readOnly }),
                    },
                );
            };
        },
    });
}
