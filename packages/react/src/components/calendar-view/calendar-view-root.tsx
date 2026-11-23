import { daysInMonth, type PlainDate } from "@fragiola/primitives/date";
import {
    fromMonthIndex,
    monthIndex,
    type PlainYearMonth,
} from "@fragiola/primitives/month-year";
import {
    type ReactNode,
    useCallback,
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    CalendarContext,
    type CalendarContextValue,
} from "../calendar/calendar-context.ts";
import { PickerBindingContext } from "../calendar/picker-binding-context.ts";
import {
    type MonthCalendarBinding,
    MonthCalendarBindingContext,
} from "../month-calendar/month-calendar-binding-context.ts";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";
import {
    CalendarViewContext,
    type CalendarViewName,
} from "./calendar-view-context.ts";

export interface CalendarViewState {
    view: CalendarViewName;
}

export interface CalendarViewRootProps {
    /** The view shown (controlled). */
    view?: CalendarViewName;
    /** The view shown first, and again when a picker reopens (uncontrolled; default `"day"`). */
    defaultView?: CalendarViewName;
    onViewChange?: (view: CalendarViewName, details: ChangeDetails) => void;
    /** The views: nodes, or a function of the state that renders the current one. */
    children?: ReactNode | ((state: CalendarViewState) => ReactNode);
}

const days = (year: number, month: number): PlainDate[] =>
    Array.from({ length: daysInMonth(year, month) }, (_, index) => ({
        year,
        month,
        day: index + 1,
    }));

const enabled = (calendar: CalendarContextValue, date: PlainDate) =>
    !calendar.cellState(date, date).disabled;

/** The enabled day of the month nearest to `day`, or `null` when every day is disabled. */
function nearestDay(
    calendar: CalendarContextValue,
    year: number,
    month: number,
    day: number,
): PlainDate | null {
    const last = daysInMonth(year, month);
    const start = Math.min(day, last);
    for (let distance = 0; distance < last; distance++) {
        for (const candidate of [start - distance, start + distance]) {
            const date = { year, month, day: candidate };
            if (
                candidate >= 1 &&
                candidate <= last &&
                enabled(calendar, date)
            ) {
                return date;
            }
        }
    }
    return null;
}

/** The enabled date of the year nearest to the same month and day. */
function nearestInYear(
    calendar: CalendarContextValue,
    year: number,
    month: number,
    day: number,
): PlainDate | null {
    for (let distance = 0; distance < 12; distance++) {
        for (const candidate of [month - distance, month + distance]) {
            if (candidate >= 1 && candidate <= 12) {
                const date = nearestDay(calendar, year, candidate, day);
                if (date !== null) {
                    return date;
                }
            }
        }
    }
    return null;
}

/**
 * A calendar's day, month and year views (spec/month-calendar.md, "Views"), inside a Calendar,
 * RangeCalendar or MultipleCalendar Root. It renders no element: the consumer renders each view's
 * parts, and a MonthCalendar or YearCalendar without a value binds to it.
 */
export function CalendarViewRoot({
    view,
    defaultView = "day",
    onViewChange,
    children,
}: CalendarViewRootProps) {
    const calendar = useRequiredContext(CalendarContext, "CalendarView.Root");
    const picker = useContext(PickerBindingContext);
    const [current, setCurrent] = useControllableState<
        CalendarViewName,
        ChangeDetails
    >(view, defaultView, onViewChange);
    // a view switched to takes the focus (its cell mounts after the press)
    const switched = useRef(false);
    const change = useCallback(
        (next: CalendarViewName, reason: "trigger-press" | "item-press") => {
            switched.current = true;
            setCurrent(next, { reason });
        },
        [setCurrent],
    );

    // a picker reopened shows the default view again, as a new calendar would
    const open = picker?.open ?? true;
    const wasOpen = useRef(open);
    useLayoutEffect(() => {
        if (wasOpen.current === open) {
            return;
        }
        wasOpen.current = open;
        if (open) {
            switched.current = false;
            setCurrent(defaultView, { reason: "none" });
        }
    });

    const kind = current === "year" ? "year" : "month";
    const focusedDate = calendar.focusedDate;
    const binding = useMemo<MonthCalendarBinding>(() => {
        const monthEnabled = (year: number, month: number) =>
            days(year, month).some((date) => enabled(calendar, date));
        const monthSelected = (year: number, month: number) =>
            days(year, month).some(
                (date) => calendar.cellState(date, date).selected,
            );
        const months = (year: number) =>
            Array.from({ length: 12 }, (_, index) => index + 1).map(
                (month) => [year, month] as const,
            );
        const byMonth =
            (test: (year: number, month: number) => boolean) =>
            (index: number) => {
                const { year, month } = fromMonthIndex(index);
                return test(year, month);
            };
        const byYear =
            (test: (year: number, month: number) => boolean) =>
            (year: number) =>
                months(year).some(([y, m]) => test(y, m));
        // a calendar system's months or years (its hook), when the calendar has one
        const units = calendar.calendar?.units(kind);
        const month = kind === "month";
        return {
            kind,
            mode: "single",
            open,
            focusOnMount: switched.current || (picker !== null && open),
            value: null,
            options: { locale: calendar.locale, calendar: calendar.calendar },
            readOnly: false,
            focus:
                units?.fromDate(focusedDate) ??
                (month ? monthIndex(focusedDate) : focusedDate.year),
            isDisabled: units
                ? (index) =>
                      !units.days(index).some((date) => enabled(calendar, date))
                : month
                  ? (index) => !byMonth(monthEnabled)(index)
                  : (year) => !byYear(monthEnabled)(year),
            isSelected: units
                ? (index) =>
                      units
                          .days(index)
                          .some(
                              (date) => calendar.cellState(date, date).selected,
                          )
                : month
                  ? byMonth(monthSelected)
                  : byYear(monthSelected),
            choose: (item: MonthCalendarValue) => {
                if (item === null || "start" in item) {
                    return;
                }
                // a month goes down to its days, on the same day (clamped, then enabled); a year
                // to its months, on the same month and day; a system's, to its nearest enabled day
                const target = units
                    ? (units.nearest(units.index(item), focusedDate, (date) =>
                          enabled(calendar, date),
                      ) ?? null)
                    : month
                      ? nearestDay(
                            calendar,
                            item.year,
                            (item as PlainYearMonth).month,
                            focusedDate.day,
                        )
                      : nearestInYear(
                            calendar,
                            item.year,
                            focusedDate.month,
                            focusedDate.day,
                        );
                if (target !== null && calendar.moveFocus(target)) {
                    if (month) {
                        calendar.requestFocus();
                    }
                    change(month ? "day" : "month", "item-press");
                }
            },
        };
    }, [kind, open, picker, calendar, focusedDate, change]);

    const context = useMemo(
        () => ({ view: current, change }),
        [current, change],
    );
    return (
        <CalendarViewContext.Provider value={context}>
            <MonthCalendarBindingContext.Provider value={binding}>
                {typeof children === "function"
                    ? children({ view: current })
                    : children}
            </MonthCalendarBindingContext.Provider>
        </CalendarViewContext.Provider>
    );
}
