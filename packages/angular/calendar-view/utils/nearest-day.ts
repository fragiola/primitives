import { daysInMonth, type PlainDate } from "@fragiola/primitives/date";
import type { CalendarState } from "@fragiola/primitives-angular/calendar";

/** Whether the calendar could focus the date (inside its bounds, not disabled). */
export const enabledDay = (calendar: CalendarState, date: PlainDate) =>
    !calendar.cellState(date, date).disabled;

/** The days of a month. */
export const daysOf = (year: number, month: number): PlainDate[] =>
    Array.from({ length: daysInMonth(year, month) }, (_, index) => ({
        year,
        month,
        day: index + 1,
    }));

/** The enabled day of the month nearest to `day`, or `null` when every day is disabled. */
export function nearestDay(
    calendar: CalendarState,
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
                enabledDay(calendar, date)
            ) {
                return date;
            }
        }
    }
    return null;
}

/** The enabled date of the year nearest to the same month and day. */
export function nearestInYear(
    calendar: CalendarState,
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
