import type {
    DateRange,
    PlainDate,
} from "@fragiola/primitives-angular/calendar";

/** The "Today" preset: a function of today. */
export const todayPreset = (today: PlainDate): PlainDate => today;

/** The "Last 7 days" preset: today − 6 to today. */
export function lastSevenDays(today: PlainDate): DateRange {
    const start = new Date(
        Date.UTC(today.year, today.month - 1, today.day - 6),
    );
    return {
        start: {
            year: start.getUTCFullYear(),
            month: start.getUTCMonth() + 1,
            day: start.getUTCDate(),
        },
        end: today,
    };
}
