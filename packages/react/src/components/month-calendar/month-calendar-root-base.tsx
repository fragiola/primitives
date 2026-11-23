import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import { type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type MonthCalendarComponent,
    MonthCalendarContext,
} from "./month-calendar-context.ts";
import type {
    MonthCalendarKind,
    MonthCalendarMode,
    MonthCalendarOptions,
} from "./month-calendar-value.ts";
import {
    type MonthCalendarStateProps,
    useMonthCalendar,
} from "./use-month-calendar.ts";

export interface MonthCalendarRootState {
    disabled: boolean;
    readOnly: boolean;
}

/** The props every month and year calendar root shares (each adds its own typed value). */
export interface MonthCalendarRootSharedProps
    extends PartProps<MonthCalendarRootState> {
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

const OPTION_KEYS: ReadonlySet<string> = new Set([
    "value",
    "defaultValue",
    "onValueChange",
    "min",
    "max",
    "isUnavailable",
    "locale",
    "columns",
    "calendar",
    "disabled",
    "readOnly",
]);

/**
 * The root element and state of a MonthCalendar, MonthRangeCalendar, YearCalendar or
 * YearRangeCalendar (spec/month-calendar.md).
 */
export function MonthCalendarRootBase({
    component,
    kind,
    mode,
    ...allProps
}: PartProps<MonthCalendarRootState> &
    MonthCalendarOptions &
    MonthCalendarStateProps & {
        component: MonthCalendarComponent;
        kind: MonthCalendarKind;
        mode: MonthCalendarMode;
    }): ReactNode {
    const stateProps: Record<string, unknown> = {};
    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(allProps)) {
        if (OPTION_KEYS.has(key)) {
            stateProps[key] = value;
        } else {
            props[key] = value;
        }
    }
    const {
        context: state,
        bound,
        focusOnMount,
        opened,
        reopened,
    } = useMonthCalendar(
        component,
        kind,
        mode,
        stateProps as MonthCalendarStateProps,
    );
    // a calendar in a picker focuses its item when it opens; one in a view when it is switched to
    const focusPending = useRef(focusOnMount);
    useLayoutEffect(() => {
        if (reopened > 0) {
            focusPending.current = true;
        }
    }, [reopened]);
    const context = useMemo(
        () => ({
            ...state,
            requestFocus: () => {
                focusPending.current = true;
            },
            focusPending,
        }),
        [state],
    );
    const { cells, focused } = state;
    // after every render while a focus is pending: the focused item's cell may have mounted in
    // this render (a new page, a picker opening; AGENTS.md "Porting", 5)
    useLayoutEffect(() => {
        if (!focusPending.current) {
            return;
        }
        if (bound && !opened) {
            focusPending.current = false;
            return;
        }
        const cell = cells.get(focused);
        if (cell) {
            focusPending.current = false;
            cell.focus({ preventScroll: true });
        }
    });
    const { disabled, readOnly } = state;
    return (
        <MonthCalendarContext.Provider value={context}>
            {renderElement(
                "div",
                props as PartProps<MonthCalendarRootState>,
                { disabled, readOnly },
                {
                    "data-primitives-part": `${component}-root`,
                    ...stateAttributes({ disabled, readonly: readOnly }),
                },
            )}
        </MonthCalendarContext.Provider>
    );
}
