import {
    compareDates,
    isSameDate,
    type PlainDate,
    toIsoDate,
} from "@fragiola/primitives/date";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CalendarContext,
    type CalendarContextValue,
} from "../calendar/calendar-context.ts";
import type {
    CalendarRootSharedProps,
    CalendarRootState,
} from "../calendar/calendar-root-base.tsx";
import { useCalendar } from "../calendar/use-calendar.ts";

export interface MultipleCalendarRootProps extends CalendarRootSharedProps {
    /** The chosen dates, sorted from the earliest (controlled). */
    value?: PlainDate[];
    /** The chosen dates at first (uncontrolled; default none). */
    defaultValue?: PlainDate[];
    onValueChange?: (value: PlainDate[], details: ChangeDetails) => void;
    /** How many dates can be chosen at most (default: no limit). */
    maxSelected?: number;
    /** The form name: one hidden input per chosen date (ISO 8601). */
    name?: string;
}

const NONE: PlainDate[] = [];

/**
 * Several dates (spec/calendar.md, "Multiple dates"): a press, Enter or Space toggles a date. Its
 * state is the Calendar's, with the dates on top; its parts are the Calendar's, named
 * `multiple-calendar-*`.
 */
export function MultipleCalendarRoot({
    value: valueProp,
    defaultValue,
    onValueChange,
    maxSelected,
    name,
    min,
    max,
    isDateUnavailable,
    locale,
    firstDayOfWeek,
    visibleMonths,
    calendar,
    disabled,
    readOnly,
    children,
    ...props
}: MultipleCalendarRootProps) {
    const [dates, setDates] = useControllableState<PlainDate[], ChangeDetails>(
        valueProp,
        defaultValue ?? NONE,
        onValueChange,
    );
    // the Calendar's state, held at the earliest date (its focused date starts there) and never
    // bound to a picker (it has a value of its own)
    const { context: state, focusKey } = useCalendar(
        "multiple-calendar",
        "single",
        {
            value: dates[0] ?? null,
            min,
            max,
            isDateUnavailable,
            locale,
            firstDayOfWeek,
            visibleMonths,
            calendar,
            disabled,
            readOnly,
        },
    );
    const focusPending = useRef(false);
    const context = useMemo<CalendarContextValue>(() => {
        const chosen = (date: PlainDate) =>
            dates.some((other) => isSameDate(other, date));
        return {
            ...state,
            // the Grid's `aria-multiselectable` (the only use of the mode by the parts)
            mode: "range",
            cellState: (date, month) => ({
                ...state.cellState(date, month),
                selected: chosen(date),
            }),
            select: (date) => {
                const cell = state.cellState(date, date);
                if (cell.disabled || cell.unavailable || state.readOnly) {
                    return;
                }
                state.moveFocus(date);
                if (chosen(date)) {
                    setDates(
                        dates.filter((other) => !isSameDate(other, date)),
                        { reason: "item-press" },
                    );
                } else if (
                    maxSelected === undefined ||
                    dates.length < maxSelected
                ) {
                    setDates([...dates, date].sort(compareDates), {
                        reason: "item-press",
                    });
                }
            },
            requestFocus: () => {
                focusPending.current = true;
            },
            focusPending,
        };
    }, [state, dates, maxSelected, setDates]);
    const { cells } = state;
    // after every render while a focus is pending: the focused date's cell may have mounted in
    // this render (a new month; AGENTS.md "Porting", 5)
    useLayoutEffect(() => {
        if (!focusPending.current) {
            return;
        }
        const cell = cells.get(focusKey);
        if (cell) {
            focusPending.current = false;
            cell.focus({ preventScroll: true });
        }
    });

    // a form reset returns the dates to their default (the reset event fires before the reset)
    const [element, ref] = useElement<HTMLElement>();
    const latest = useRef({ defaultValue, setDates });
    latest.current = { defaultValue, setDates };
    const named = name !== undefined;
    useEffect(() => {
        const form = named ? element?.closest("form") : null;
        if (!form) {
            return undefined;
        }
        let timer: ReturnType<typeof setTimeout> | undefined;
        const onReset = () => {
            timer = setTimeout(() => {
                const current = latest.current;
                current.setDates(current.defaultValue ?? NONE, {
                    reason: "none",
                });
            });
        };
        form.addEventListener("reset", onReset);
        return () => {
            clearTimeout(timer);
            form.removeEventListener("reset", onReset);
        };
    }, [element, named]);

    const rootState: CalendarRootState = {
        disabled: state.disabled,
        readOnly: state.readOnly,
    };
    return (
        <CalendarContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...(props as PartProps<CalendarRootState>),
                    children: (
                        <>
                            {children}
                            {name === undefined
                                ? null
                                : dates.map((date) => (
                                      <input
                                          key={toIsoDate(date)}
                                          type="hidden"
                                          name={name}
                                          value={toIsoDate(date)}
                                          disabled={state.disabled}
                                          data-primitives-part="multiple-calendar-input"
                                      />
                                  ))}
                        </>
                    ),
                },
                rootState,
                {
                    "data-primitives-part": "multiple-calendar-root",
                    ...stateAttributes({
                        disabled: rootState.disabled,
                        readonly: rootState.readOnly,
                    }),
                },
                ref,
            )}
        </CalendarContext.Provider>
    );
}
