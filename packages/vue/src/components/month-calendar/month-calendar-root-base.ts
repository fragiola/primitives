import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import { defineComponent, nextTick, type PropType, provide, watch } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type MonthCalendarComponent,
    MonthCalendarKey,
} from "./month-calendar-context.ts";
import type {
    MonthCalendarItem,
    MonthCalendarKind,
    MonthCalendarMode,
    MonthCalendarValue,
} from "./month-calendar-value.ts";
import { useMonthCalendar } from "./use-month-calendar.ts";

export interface MonthCalendarRootState {
    disabled: boolean;
    readOnly: boolean;
}

/** The props every month and year calendar root shares (each adds its own typed value). */
export interface MonthCalendarRootSharedProps {
    /** Items per row (default 3). */
    columns?: number;
    /** A BCP 47 tag (default: the document's `lang`, then the browser's). */
    locale?: string;
    /**
     * A calendar system from `@fragiola/primitives/calendar-systems` (spec/calendar-systems.md):
     * the items are its months (a page is its year) or years, and so are the values.
     */
    calendar?: CalendarSystem;
    disabled?: boolean;
    readOnly?: boolean;
}

/** The options every month and year calendar root and picker root takes. */
export const monthCalendarOptionProps = {
    min: {
        type: Object as PropType<MonthCalendarItem | null>,
        default: undefined,
    },
    max: {
        type: Object as PropType<MonthCalendarItem | null>,
        default: undefined,
    },
    isUnavailable: {
        type: Function as PropType<(item: MonthCalendarItem) => boolean>,
        default: undefined,
    },
    locale: { type: String, default: undefined },
    columns: { type: Number, default: undefined },
    calendar: {
        type: Object as PropType<CalendarSystem>,
        default: undefined,
    },
};

export const monthCalendarRootProps = {
    ...asProp,
    value: {
        type: Object as PropType<MonthCalendarValue>,
        default: undefined,
    },
    defaultValue: {
        type: Object as PropType<MonthCalendarValue>,
        default: undefined,
    },
    ...monthCalendarOptionProps,
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
};

/** `v-model:value`, and `@value-change="(value, details) => ..."` with the reason. */
export const monthCalendarRootEmits = {
    "update:value": (_value: MonthCalendarValue) => true,
    valueChange: (_value: MonthCalendarValue, _details: ChangeDetails) => true,
};

/**
 * The root element and state of a MonthCalendar, MonthRangeCalendar, YearCalendar or
 * YearRangeCalendar (spec/month-calendar.md).
 */
export function defineMonthCalendarRoot(
    name: string,
    component: MonthCalendarComponent,
    kind: MonthCalendarKind,
    mode: MonthCalendarMode,
) {
    return defineComponent({
        name,
        inheritAttrs: false,
        props: monthCalendarRootProps,
        emits: monthCalendarRootEmits,
        setup(props, { attrs, slots, emit }) {
            const { context, opened } = useMonthCalendar(
                component,
                kind,
                mode,
                props,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            provide(MonthCalendarKey, context);
            const focusPendingCell = () => {
                if (!context.focusPending.current) {
                    return;
                }
                const cell = context.cells.get(context.focused.value);
                if (cell) {
                    context.focusPending.current = false;
                    cell.focus({ preventScroll: true });
                }
            };
            // reopened while its exit animation still ran, the same calendar takes the focus again
            watch(opened, (open) => {
                if (open) {
                    context.focusPending.current = true;
                    void nextTick().then(focusPendingCell);
                }
            });
            // after a render while a focus is pending: the focused item's cell may have mounted in
            // it (a new page, a picker opening; AGENTS.md "Porting", 5); a cell that mounts later
            // takes the focus itself
            watch(
                () => [context.focused.value, context.pageStart.value] as const,
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
