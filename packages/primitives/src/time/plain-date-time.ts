import type { PlainDate } from "../date/plain-date.ts";
import {
    compareTimes,
    fromIsoTime,
    type IsoTimePrecision,
    type PlainTime,
    type TimeDuration,
    toIsoTime,
} from "./plain-time.ts";

/**
 * A date and a wall-clock time with no time zone (spec/date-field.md, "Values"): a
 * {@link PlainDate} and a {@link PlainTime} in one flat object, so it is also a `PlainDate` (the
 * date math and the calendars take it) and a `PlainTime`.
 */
export interface PlainDateTime extends PlainDate, PlainTime {}

/** An amount to add to a date and time, field by field (each may be negative). */
export interface DateTimeDuration extends TimeDuration {
    readonly years?: number;
    readonly months?: number;
    readonly days?: number;
}

const MS_PER_DAY = 86_400_000;

/** A UTC `Date` of the fields, years 0–99 included (`Date.UTC` reads them as 19xx). */
function utc(year: number, month: number, day: number, ms: number): Date {
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(0, 0, 0, ms);
    return date;
}

function fromUtc(date: Date): PlainDateTime {
    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hour: date.getUTCHours(),
        minute: date.getUTCMinutes(),
        second: date.getUTCSeconds(),
        millisecond: date.getUTCMilliseconds(),
    };
}

function timeMilliseconds(time: Partial<PlainTime>): number {
    return (
        ((time.hour ?? 0) * 60 + (time.minute ?? 0)) * 60_000 +
        (time.second ?? 0) * 1000 +
        (time.millisecond ?? 0)
    );
}

/**
 * Builds a date and time from a date and a time (midnight when `time` is left out), normalizing
 * overflow (`{ hour: 24 }` is midnight of the next day).
 */
export function plainDateTime(
    date: PlainDate,
    time: Partial<PlainTime> = {},
): PlainDateTime {
    return fromUtc(
        utc(date.year, date.month, date.day, timeMilliseconds(time)),
    );
}

/** The local date and time of `now` (the clock the page sees). */
export function currentDateTime(now: Date = new Date()): PlainDateTime {
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        millisecond: now.getMilliseconds(),
    };
}

/** The date of a date and time. */
export function toPlainDate(value: PlainDate): PlainDate {
    return { year: value.year, month: value.month, day: value.day };
}

/** The time of a date and time. */
export function toPlainTime(value: PlainTime): PlainTime {
    return {
        hour: value.hour,
        minute: value.minute,
        second: value.second,
        millisecond: value.millisecond,
    };
}

/**
 * Negative when `a` is before `b`, positive when after, 0 when the same instant of the wall
 * clock. A `PlainDate` counts as its midnight, so a date and time compares with a date bound.
 */
export function compareDateTimes(
    a: PlainDate & Partial<PlainTime>,
    b: PlainDate & Partial<PlainTime>,
): number {
    return (
        a.year - b.year ||
        a.month - b.month ||
        a.day - b.day ||
        compareTimes(
            {
                hour: a.hour ?? 0,
                minute: a.minute ?? 0,
                second: a.second ?? 0,
                millisecond: a.millisecond ?? 0,
            },
            {
                hour: b.hour ?? 0,
                minute: b.minute ?? 0,
                second: b.second ?? 0,
                millisecond: b.millisecond ?? 0,
            },
        )
    );
}

export function isSameDateTime(
    a: PlainDateTime | null | undefined,
    b: PlainDateTime | null | undefined,
): boolean {
    return a != null && b != null && compareDateTimes(a, b) === 0;
}

/**
 * Adds a duration: the years and months first (the day clamped to the month's last day, as the
 * calendars' `addMonths`), then the days and the time, carrying across midnight.
 */
export function addDateTime(
    value: PlainDateTime,
    duration: DateTimeDuration,
): PlainDateTime {
    const months =
        value.year * 12 +
        (value.month - 1) +
        (duration.years ?? 0) * 12 +
        (duration.months ?? 0);
    const year = Math.floor(months / 12);
    const month = (months % 12) + 1;
    const last = utc(year, month + 1, 0, 0).getUTCDate();
    const day = Math.min(value.day, last);
    const ms =
        timeMilliseconds(value) +
        (duration.days ?? 0) * MS_PER_DAY +
        (duration.hours ?? 0) * 3_600_000 +
        (duration.minutes ?? 0) * 60_000 +
        (duration.seconds ?? 0) * 1000 +
        (duration.milliseconds ?? 0);
    return fromUtc(utc(year, month, day, ms));
}

const pad = (value: number, size = 2) => String(value).padStart(size, "0");

/** `2026-11-23T14:30` (ISO 8601, as `<input type="datetime-local">` writes it); see `toIsoTime`. */
export function toIsoDateTime(
    value: PlainDateTime,
    precision: IsoTimePrecision = "auto",
): string {
    return `${pad(value.year, 4)}-${pad(value.month)}-${pad(value.day)}T${toIsoTime(value, precision)}`;
}

/** Parses `YYYY-MM-DDTHH:MM[:SS[.sss]]`; `null` when the text is not a valid date and time. */
export function fromIsoDateTime(text: string): PlainDateTime | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(.+)$/.exec(text);
    if (match === null) {
        return null;
    }
    const time = fromIsoTime(match[4] as string);
    if (time === null) {
        return null;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = fromUtc(utc(year, month, day, 0));
    if (date.year !== year || date.month !== month || date.day !== day) {
        return null;
    }
    return { year, month, day, ...time };
}
