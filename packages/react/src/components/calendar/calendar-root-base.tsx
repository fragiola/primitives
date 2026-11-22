import { type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type CalendarComponent, CalendarContext } from "./calendar-context.ts";
import type { CalendarMode, CalendarOptions } from "./calendar-value.ts";
import { type CalendarStateProps, useCalendar } from "./use-calendar.ts";

export interface CalendarRootState {
    disabled: boolean;
    readOnly: boolean;
}

/** The props both calendar roots share (each adds its own typed value). */
export interface CalendarRootSharedProps
    extends PartProps<CalendarRootState>,
        CalendarOptions {
    disabled?: boolean;
    readOnly?: boolean;
}

const OPTION_KEYS: ReadonlySet<string> = new Set([
    "value",
    "defaultValue",
    "onValueChange",
    "min",
    "max",
    "isDateUnavailable",
    "locale",
    "firstDayOfWeek",
    "visibleMonths",
    "disabled",
    "readOnly",
]);

/** The root element and state of a Calendar or a RangeCalendar (spec/calendar.md). */
export function CalendarRootBase({
    component,
    mode,
    ...allProps
}: CalendarRootSharedProps &
    CalendarStateProps & {
        component: CalendarComponent;
        mode: CalendarMode;
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
        opened,
        focusKey,
    } = useCalendar(component, mode, stateProps as CalendarStateProps);
    // a calendar in a picker focuses its focused date when it opens (spec/calendar.md, "Focus")
    const focusPending = useRef(bound);
    // reopened while its exit animation still ran, the same calendar takes the focus again
    useLayoutEffect(() => {
        if (opened) {
            focusPending.current = true;
        }
    }, [opened]);
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
    const { cells } = state;
    // after every render while a focus is pending: the focused date's cell may have mounted in
    // this render (a new month, a picker opening; AGENTS.md "Porting", 5)
    useLayoutEffect(() => {
        if (!focusPending.current) {
            return;
        }
        // a calendar inside a closing picker takes no focus: the picker returns it to its trigger
        if (bound && !opened) {
            focusPending.current = false;
            return;
        }
        const cell = cells.get(focusKey);
        if (cell) {
            focusPending.current = false;
            cell.focus({ preventScroll: true });
        }
    });
    const { disabled, readOnly } = state;
    return (
        <CalendarContext.Provider value={context}>
            {renderElement(
                "div",
                props as PartProps<CalendarRootState>,
                { disabled, readOnly },
                {
                    "data-primitives-part": `${component}-root`,
                    ...stateAttributes({ disabled, readonly: readOnly }),
                },
            )}
        </CalendarContext.Provider>
    );
}
