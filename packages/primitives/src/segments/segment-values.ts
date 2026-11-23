import type { PlainDate } from "../date/plain-date.ts";
import type { PlainDateTime } from "../time/plain-date-time.ts";
import type { PlainTime } from "../time/plain-time.ts";
import type { ZonedDateTime } from "../time-zone/zoned-date-time.ts";
import type {
    EditableSegmentType,
    HourCycle,
    SegmentFormat,
} from "./segment-format.ts";

/**
 * What the user has set of a field, segment by segment (spec/date-field.md, "Editing"): a
 * segment left out is a placeholder. `hour` is 0–23 whatever the hour cycle; `dayPeriod` (0 AM,
 * 1 PM) is kept only once the user set it (with an hour set, the hour's half of the day agrees
 * with it). A plain, immutable object: every function returns a new one.
 */
export type SegmentValues = {
    readonly [type in EditableSegmentType]?: number;
};

/** A segment's range, in the unit it shows (an hour in its cycle: 1–12 for `h12`). */
export interface SegmentRange {
    readonly min: number;
    readonly max: number;
    /** The most digits it is typed with (`0` for the day period, typed by a letter). */
    readonly digits: number;
}

/** The amount Page Up and Page Down step a segment by (spec/date-field.md, "Keyboard"). */
export const SEGMENT_PAGE_STEPS: Readonly<Record<EditableSegmentType, number>> =
    {
        era: 1,
        year: 5,
        month: 2,
        day: 7,
        hour: 2,
        minute: 15,
        second: 15,
        dayPeriod: 1,
    };

/**
 * The calendar system's arithmetic year of the values (spec/calendar-systems.md, "In the fields"):
 * the year segment is an era's year where the era is edited (the current era while it is a
 * placeholder), else the system's year; `undefined` while the year is a placeholder.
 */
export function calendarYear(
    format: SegmentFormat,
    values: SegmentValues,
): number | undefined {
    const { calendar } = format;
    if (values.year === undefined || calendar === undefined) {
        return values.year;
    }
    return format.eras
        ? calendar.yearOfEra(values.era ?? format.eras.length - 1, values.year)
        : values.year;
}

/**
 * The days of the values' month; a month with no year set counts as in a leap year (February has
 * 29; a calendar system's longest year).
 */
function monthDays(format: SegmentFormat, values: SegmentValues): number {
    const { calendar } = format;
    const month = values.month ?? 1;
    if (calendar) {
        const year = calendarYear(format, values) ?? calendar.referenceYear();
        return calendar.daysInMonth(
            year,
            Math.min(month, calendar.monthsInYear(year)),
        );
    }
    const date = new Date(0);
    date.setUTCFullYear(values.year ?? 2000, month, 0);
    return date.getUTCDate();
}

function hourRange(cycle: HourCycle | null): { min: number; max: number } {
    switch (cycle) {
        case "h11":
            return { min: 0, max: 11 };
        case "h12":
            return { min: 1, max: 12 };
        case "h24":
            return { min: 1, max: 24 };
        default:
            return { min: 0, max: 23 };
    }
}

/** The range of a segment, given what else is set (a day's maximum follows its month and year). */
export function segmentRange(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
): SegmentRange {
    const { calendar } = format;
    switch (type) {
        case "era":
            return { min: 0, max: (format.eras?.length ?? 1) - 1, digits: 0 };
        case "year":
            return { min: 1, max: 9999, digits: 4 };
        case "month":
            return {
                min: 1,
                // a calendar system's months in the year (13 in a Hebrew leap year)
                max: calendar
                    ? calendar.monthsInYear(
                          calendarYear(format, values) ??
                              calendar.referenceYear(),
                      )
                    : 12,
                digits: 2,
            };
        case "day":
            return {
                min: 1,
                max:
                    values.month === undefined ? 31 : monthDays(format, values),
                digits: 2,
            };
        case "hour":
            return { ...hourRange(format.hourCycle), digits: 2 };
        case "minute":
        case "second":
            return { min: 0, max: 59, digits: 2 };
        case "dayPeriod":
            return { min: 0, max: 1, digits: 0 };
    }
}

/** The half of the day the values are in: the set day period, else the hour's, else `fallback`. */
function dayPeriodOf(values: SegmentValues, fallback = 0): number {
    if (values.dayPeriod !== undefined) {
        return values.dayPeriod;
    }
    return values.hour === undefined ? fallback : values.hour >= 12 ? 1 : 0;
}

/** The hour as its cycle shows it (`h12`: 0 → 12, 13 → 1). */
export function displayHour(hour: number, cycle: HourCycle | null): number {
    switch (cycle) {
        case "h11":
            return hour % 12;
        case "h12":
            return hour % 12 || 12;
        case "h24":
            return hour || 24;
        default:
            return hour;
    }
}

/** The 0–23 hour of a shown hour in its cycle and half of the day. */
function hourOf(
    shown: number,
    cycle: HourCycle | null,
    period: number,
): number {
    switch (cycle) {
        case "h11":
        case "h12":
            return (shown % 12) + (period === 1 ? 12 : 0);
        case "h24":
            return shown % 24;
        default:
            return shown;
    }
}

/** A segment's value in the unit it shows; `undefined` while it is a placeholder. */
export function shownValue(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
): number | undefined {
    if (type === "hour") {
        return values.hour === undefined
            ? undefined
            : displayHour(values.hour, format.hourCycle);
    }
    return values[type];
}

/**
 * The day clamped into its month, once the month (or the year, or the era) changed; in a calendar
 * system the month too into its year (a Hebrew common year has 12).
 */
function clampDay(format: SegmentFormat, values: SegmentValues): SegmentValues {
    let next = values;
    const { calendar } = format;
    if (calendar && next.month !== undefined) {
        const months = segmentRange(format, next, "month").max;
        if (next.month > months) {
            next = { ...next, month: months };
        }
    }
    if (next.day === undefined || next.month === undefined) {
        return next;
    }
    const last = monthDays(format, next);
    return next.day > last ? { ...next, day: last } : next;
}

/**
 * Sets a segment to a value in the unit it shows (an hour in its cycle, kept in its half of the
 * day; a day period moves a set hour into its half), or clears it with `undefined`. A day past
 * its month's end is clamped into it.
 */
export function setSegment(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
    shown: number | undefined,
    seed: SegmentValues = {},
): SegmentValues {
    const next: { -readonly [key in EditableSegmentType]?: number } = {
        ...values,
    };
    if (shown === undefined) {
        delete next[type];
        return next;
    }
    if (type === "hour") {
        const period = format.types.includes("dayPeriod")
            ? dayPeriodOf(values, dayPeriodOf(seed))
            : shown >= 12
              ? 1
              : 0;
        next.hour = hourOf(shown, format.hourCycle, period);
        return next;
    }
    if (type === "dayPeriod") {
        next.dayPeriod = shown;
        if (next.hour !== undefined) {
            next.hour = (next.hour % 12) + (shown === 1 ? 12 : 0);
        }
        return next;
    }
    next[type] = shown;
    return type === "month" || type === "year" || type === "era"
        ? clampDay(format, next)
        : next;
}

/**
 * Steps a segment by `amount`, wrapping within its range and carrying nothing into the others (an
 * hour of a 12-hour cycle stays in its half of the day; the day period toggles). A placeholder
 * takes the seed's value instead (the field's `placeholderValue`), with no step.
 */
export function stepSegment(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
    amount: number,
    seed: SegmentValues = {},
): SegmentValues {
    const current = shownValue(format, values, type);
    if (current === undefined) {
        if (type === "dayPeriod") {
            return setSegment(
                format,
                values,
                type,
                dayPeriodOf(values, dayPeriodOf(seed)),
            );
        }
        const seeded =
            type === "hour"
                ? displayHour(seed.hour ?? 0, format.hourCycle)
                : seed[type];
        const range = segmentRange(format, values, type);
        return setSegment(
            format,
            values,
            type,
            Math.min(Math.max(seeded ?? range.min, range.min), range.max),
            seed,
        );
    }
    const { min, max } = segmentRange(format, values, type);
    const size = max - min + 1;
    const next = ((((current - min + amount) % size) + size) % size) + min;
    return setSegment(format, values, type, next, seed);
}

/** Sets a segment to the edge of its range (Home: `min`, End: `max`). */
export function segmentToEdge(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
    edge: "min" | "max",
    seed: SegmentValues = {},
): SegmentValues {
    const range = segmentRange(format, values, type);
    return setSegment(format, values, type, range[edge], seed);
}

/** Whether every editable segment of the format is set. */
export function isSegmentsComplete(
    format: SegmentFormat,
    values: SegmentValues,
): boolean {
    return format.types.every((type) => values[type] !== undefined);
}

/**
 * The segment values of a date, a time or a date and time (only the format's segments; a day
 * period follows the hour). `null` gives no value: every segment a placeholder.
 */
export function segmentValuesOf(
    format: SegmentFormat,
    input: Partial<PlainDateTime> | null | undefined,
): SegmentValues {
    if (input == null) {
        return {};
    }
    const { calendar, timeZone } = format;
    let value: Partial<PlainDateTime> & { era?: number } = input;
    // a zoned value from another zone shows in the field's (spec/time-zones.md)
    if (timeZone && "offset" in input && "timeZone" in input) {
        value = timeZone.convert(input as ZonedDateTime);
    }
    if (
        calendar &&
        value.year !== undefined &&
        value.month !== undefined &&
        value.day !== undefined
    ) {
        const fields = calendar.fields(value as PlainDate);
        value = {
            ...value,
            era: fields.era,
            year: format.eras ? fields.eraYear : fields.year,
            month: fields.month,
            day: fields.day,
        };
    }
    const result: { -readonly [key in EditableSegmentType]?: number } = {};
    for (const type of format.types) {
        if (type === "dayPeriod") {
            if (value.hour !== undefined) {
                result.dayPeriod = value.hour >= 12 ? 1 : 0;
            }
            continue;
        }
        const field = value[type];
        if (field !== undefined) {
            result[type] = field;
        }
    }
    return result;
}

/**
 * The date of complete values (`null` while a date segment is a placeholder); with a calendar
 * system's `format`, the ISO date of its fields.
 */
export function segmentsToDate(
    values: SegmentValues,
    format?: SegmentFormat,
): PlainDate | null {
    const { month, day } = values;
    const year = format ? calendarYear(format, values) : values.year;
    if (year === undefined || month === undefined || day === undefined) {
        return null;
    }
    return format?.calendar
        ? format.calendar.fromFields({ year, month, day })
        : { year, month, day };
}

/** The time of values (the segments a format has not are 0); `null` with no hour. */
export function segmentsToTime(values: SegmentValues): PlainTime | null {
    return values.hour === undefined
        ? null
        : {
              hour: values.hour,
              minute: values.minute ?? 0,
              second: values.second ?? 0,
              millisecond: 0,
          };
}

/**
 * The date and time of values; `null` while the date or the hour is a placeholder. With a time
 * zone's `format`, a `ZonedDateTime` resolved with its `disambiguation` (`null` when `reject`
 * meets a wall time the zone skips or repeats).
 */
export function segmentsToDateTime(
    values: SegmentValues,
    format?: SegmentFormat,
): PlainDateTime | null {
    const date = segmentsToDate(values, format);
    const time = segmentsToTime(values);
    if (date === null || time === null) {
        return null;
    }
    const wall = { ...date, ...time };
    if (!format?.timeZone) {
        return wall;
    }
    try {
        return format.timeZone.resolve(wall, format.disambiguation);
    } catch {
        return null;
    }
}
