/**
 * A wall-clock time with no date and no time zone (spec/date-field.md, "Values"). `hour` is
 * 0–23, `minute` and `second` 0–59, `millisecond` 0–999. Values are plain, immutable objects:
 * every function returns a new one.
 */
export interface PlainTime {
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
}

/** A field of a time, the unit of {@link addTime} and {@link cycleTime}. */
export type TimeField = "hour" | "minute" | "second" | "millisecond";

/** An amount to add to a time, field by field (each may be negative). */
/**
 * A range of times of day, `{ start, end }` (a TimeRangeField's value, spec/date-range-field.md):
 * the time counterpart of `/date`'s `DateRange`. An end before its start is a value too, an
 * invalid one (no range across midnight).
 */
export interface TimeRange {
    readonly start: PlainTime;
    readonly end: PlainTime;
}

export interface TimeDuration {
    readonly hours?: number;
    readonly minutes?: number;
    readonly seconds?: number;
    readonly milliseconds?: number;
}

const MS_PER_DAY = 86_400_000;

const LIMITS: Readonly<Record<TimeField, number>> = {
    hour: 24,
    minute: 60,
    second: 60,
    millisecond: 1000,
};

/** Milliseconds since midnight. */
function toMilliseconds(time: PlainTime): number {
    return (
        ((time.hour * 60 + time.minute) * 60 + time.second) * 1000 +
        time.millisecond
    );
}

/** The time `ms` milliseconds after midnight, wrapped into one day. */
function fromMilliseconds(ms: number): PlainTime {
    const day = ((Math.trunc(ms) % MS_PER_DAY) + MS_PER_DAY) % MS_PER_DAY;
    return {
        hour: Math.floor(day / 3_600_000),
        minute: Math.floor(day / 60_000) % 60,
        second: Math.floor(day / 1000) % 60,
        millisecond: day % 1000,
    };
}

/**
 * Builds a time, wrapping overflow around midnight (`plainTime(25)` is 01:00, `plainTime(0, -1)`
 * is 23:59), as a clock does.
 */
export function plainTime(
    hour: number,
    minute = 0,
    second = 0,
    millisecond = 0,
): PlainTime {
    return fromMilliseconds(
        ((hour * 60 + minute) * 60 + second) * 1000 + millisecond,
    );
}

/** The local time of `now` (the clock the page sees). */
export function currentTime(now: Date = new Date()): PlainTime {
    return {
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        millisecond: now.getMilliseconds(),
    };
}

/** Negative when `a` is earlier than `b`, positive when later, 0 when the same time. */
export function compareTimes(a: PlainTime, b: PlainTime): number {
    return toMilliseconds(a) - toMilliseconds(b);
}

export function isSameTime(
    a: PlainTime | null | undefined,
    b: PlainTime | null | undefined,
): boolean {
    return a != null && b != null && compareTimes(a, b) === 0;
}

/** Adds a duration, carrying between fields and wrapping around midnight (23:30 + 1 h = 00:30). */
export function addTime(time: PlainTime, duration: TimeDuration): PlainTime {
    return fromMilliseconds(
        toMilliseconds(time) +
            (duration.hours ?? 0) * 3_600_000 +
            (duration.minutes ?? 0) * 60_000 +
            (duration.seconds ?? 0) * 1000 +
            (duration.milliseconds ?? 0),
    );
}

/**
 * Adds `amount` to one field only, wrapping within it and carrying nothing (10:59 + 1 minute is
 * 10:00): the way a time field's segment steps (spec/date-field.md, "Keyboard").
 */
export function cycleTime(
    time: PlainTime,
    field: TimeField,
    amount: number,
): PlainTime {
    const limit = LIMITS[field];
    return {
        ...time,
        [field]: (((time[field] + amount) % limit) + limit) % limit,
    };
}

/** How many fields an ISO time writes: `auto` writes the shortest exact form. */
export type IsoTimePrecision = "auto" | "minute" | "second" | "millisecond";

const pad = (value: number, size = 2) => String(value).padStart(size, "0");

/**
 * `14:30`, `14:30:05`, `14:30:05.120` (ISO 8601, as `<input type="time">` writes it). `auto`
 * (the default) leaves out the seconds and milliseconds when they are 0; the other precisions
 * write exactly their fields, dropping the smaller ones.
 */
export function toIsoTime(
    time: PlainTime,
    precision: IsoTimePrecision = "auto",
): string {
    const base = `${pad(time.hour)}:${pad(time.minute)}`;
    const resolved =
        precision !== "auto"
            ? precision
            : time.millisecond !== 0
              ? "millisecond"
              : time.second !== 0
                ? "second"
                : "minute";
    if (resolved === "minute") {
        return base;
    }
    const seconds = `${base}:${pad(time.second)}`;
    return resolved === "second"
        ? seconds
        : `${seconds}.${pad(time.millisecond, 3)}`;
}

/**
 * Parses `HH:MM`, `HH:MM:SS` or `HH:MM:SS.s` (one to three fraction digits); `null` when the text
 * is not a valid time.
 */
export function fromIsoTime(text: string): PlainTime | null {
    const match = /^(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(text);
    if (match === null) {
        return null;
    }
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    const second = match[3] === undefined ? 0 : Number(match[3]);
    const millisecond =
        match[4] === undefined ? 0 : Number(match[4].padEnd(3, "0"));
    if (hour > 23 || minute > 59 || second > 59) {
        return null;
    }
    return { hour, minute, second, millisecond };
}
