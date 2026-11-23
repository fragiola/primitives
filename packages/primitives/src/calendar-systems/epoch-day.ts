import type { PlainDate } from "../date/plain-date.ts";

const DAY = 86_400_000;

/** A UTC `Date` at midnight of an ISO date, years 0–99 included (`Date.UTC` reads them as 19xx). */
export function utcMidnight(date: PlainDate): Date {
    const utc = new Date(0);
    utc.setUTCFullYear(date.year, date.month - 1, date.day);
    return utc;
}

/** The days from 1970-01-01 to an ISO date. */
export function toEpochDay(date: PlainDate): number {
    return Math.round(utcMidnight(date).getTime() / DAY);
}

/** The date `days` later (the `/date` math, kept here: this entry imports no other's code). */
export function addDays(date: PlainDate, days: number): PlainDate {
    return fromEpochDay(toEpochDay(date) + days);
}

/** The first day of the date's week, given the locale's first day (0 = Sunday). */
export function startOfWeek(
    date: PlainDate,
    firstDayOfWeek: number,
): PlainDate {
    const day = toEpochDay(date);
    // 1970-01-01 was a Thursday (4)
    const weekday = (((day + 4) % 7) + 7) % 7;
    return fromEpochDay(day - ((weekday - firstDayOfWeek + 7) % 7));
}

/** The ISO date `days` after 1970-01-01. */
export function fromEpochDay(days: number): PlainDate {
    const utc = new Date(days * DAY);
    return {
        year: utc.getUTCFullYear(),
        month: utc.getUTCMonth() + 1,
        day: utc.getUTCDate(),
    };
}
