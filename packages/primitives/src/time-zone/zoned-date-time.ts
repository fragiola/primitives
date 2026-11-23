import type {
    DateTimeDuration,
    PlainDateTime,
} from "../time/plain-date-time.ts";
import type { IsoTimePrecision, TimeField } from "../time/plain-time.ts";

/**
 * A date and wall-clock time in a time zone (spec/time-zones.md, "Values"): a `PlainDateTime`
 * with its IANA `timeZone` and the `offset` from UTC it has there, in milliseconds (positive east:
 * `+05:30` is 19 800 000). The offset tells the two times of a DST overlap apart. A plain,
 * immutable object: every function returns a new one.
 */
export interface ZonedDateTime extends PlainDateTime {
    readonly timeZone: string;
    readonly offset: number;
}

/**
 * Which time a wall-clock time names when its zone skips it (a DST gap) or repeats it (an
 * overlap), as Temporal's `disambiguation`: `compatible` (the default) takes the later one in a
 * gap and the earlier in an overlap, `earlier` and `later` always that one, `reject` throws a
 * `RangeError`.
 */
export type Disambiguation = "compatible" | "earlier" | "later" | "reject";

const HOUR = 3_600_000;
const DAY = 86_400_000;
const formats = new Map<string, Intl.DateTimeFormat>();

// The `/time` helpers this entry needs, kept here: it imports no other entry's code, so the
// toolkit's chunks (and every existing entry's size) stay as they were.

const pad = (value: number, size = 2) =>
    String(Math.abs(value)).padStart(size, "0");

/** `2026-11-23T14:30` at a precision (`/time`'s `toIsoDateTime`). */
function toIsoDateTime(
    value: PlainDateTime,
    precision: IsoTimePrecision = "auto",
): string {
    const resolved =
        precision !== "auto"
            ? precision
            : value.millisecond !== 0
              ? "millisecond"
              : value.second !== 0
                ? "second"
                : "minute";
    let text = `${value.year < 0 ? "-" : ""}${pad(value.year, 4)}-${pad(value.month)}-${pad(value.day)}T${pad(value.hour)}:${pad(value.minute)}`;
    if (resolved !== "minute") {
        text += `:${pad(value.second)}`;
    }
    return resolved === "millisecond"
        ? `${text}.${pad(value.millisecond, 3)}`
        : text;
}

/** Parses `YYYY-MM-DDTHH:MM[:SS[.sss]]` (`/time`'s `fromIsoDateTime`); `null` when invalid. */
function fromIsoDateTime(text: string): PlainDateTime | null {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(
            text,
        );
    if (match === null) {
        return null;
    }
    const [year, month, day, hour, minute] = match.slice(1, 6).map(Number) as [
        number,
        number,
        number,
        number,
        number,
    ];
    const value: PlainDateTime = {
        year,
        month,
        day,
        hour,
        minute,
        second: Number(match[6] ?? 0),
        millisecond: Number((match[7] ?? "0").padEnd(3, "0")),
    };
    const back = fromWallTime(wallTime(value));
    return back.month === month &&
        back.day === day &&
        hour < 24 &&
        minute < 60 &&
        value.second < 60
        ? value
        : null;
}

/** The years, months and days of a duration added to a wall time, the day clamped to its month. */
function addDate(
    value: PlainDateTime,
    years: number,
    months: number,
    days: number,
): PlainDateTime {
    const total = value.year * 12 + value.month - 1 + years * 12 + months;
    const year = Math.floor(total / 12);
    const month = total - year * 12 + 1;
    const last = fromWallTime(
        wallTime({ ...value, year, month: month + 1, day: 0 }),
    ).day;
    return fromWallTime(
        wallTime({ ...value, year, month, day: Math.min(value.day, last) }) +
            days * DAY,
    );
}

/** The wall-clock fields' UTC milliseconds (as if the zone were UTC), years 0–99 included. */
function wallTime(value: PlainDateTime): number {
    const date = new Date(0);
    date.setUTCFullYear(value.year, value.month - 1, value.day);
    date.setUTCHours(value.hour, value.minute, value.second, value.millisecond);
    return date.getTime();
}

function fromWallTime(ms: number): PlainDateTime {
    const date = new Date(ms);
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

function zoneFormat(timeZone: string): Intl.DateTimeFormat {
    let format = formats.get(timeZone);
    if (format === undefined) {
        format = new Intl.DateTimeFormat("en-US", {
            timeZone,
            hourCycle: "h23",
            era: "short",
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        });
        formats.set(timeZone, format);
    }
    return format;
}

/**
 * The zone's offset from UTC at an instant, in milliseconds, read from `Intl` (the wall-clock
 * fields it writes there, less the instant).
 */
export function offsetAt(timeZone: string, epochMs: number): number {
    const second = Math.floor(epochMs / 1000) * 1000;
    const fields: Record<string, string> = {};
    for (const part of zoneFormat(timeZone).formatToParts(second)) {
        fields[part.type] = part.value;
    }
    const year =
        fields.era === "BC" || fields.era === "B"
            ? 1 - Number(fields.year)
            : Number(fields.year);
    const wall = wallTime({
        year,
        month: Number(fields.month),
        day: Number(fields.day),
        hour: Number(fields.hour) % 24,
        minute: Number(fields.minute),
        second: Number(fields.second),
        millisecond: 0,
    });
    return wall - second;
}

/** The zone the page runs in (`Intl`'s default). */
export function localTimeZone(): string {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** The instant (epoch milliseconds) of a zoned date and time. */
export function toInstant(value: ZonedDateTime): number {
    return wallTime(value) - value.offset;
}

/** The date and time an instant (epoch milliseconds or a `Date`) has in a zone. */
export function fromInstant(
    instant: number | Date,
    timeZone: string,
): ZonedDateTime {
    const ms = typeof instant === "number" ? instant : instant.getTime();
    const offset = offsetAt(timeZone, ms);
    return { ...fromWallTime(ms + offset), timeZone, offset };
}

/**
 * The instants a wall-clock time names in a zone: one, two in an overlap (earlier first), none in
 * a gap.
 */
function candidates(timeZone: string, wall: number): number[] {
    const before = offsetAt(timeZone, wall - DAY);
    const after = offsetAt(timeZone, wall + DAY);
    const found = new Set<number>();
    for (const offset of [before, after]) {
        const instant = wall - offset;
        if (offsetAt(timeZone, instant) === offset) {
            found.add(instant);
        }
    }
    return [...found].sort((a, b) => a - b);
}

/**
 * A wall-clock date and time in a zone (spec/time-zones.md, "DST gaps and overlaps"), resolved
 * with `disambiguation` when the zone skips or repeats it. In a gap, `compatible` and `later` move
 * it forward by the gap (02:30 becomes 03:30), `earlier` back (01:30); `reject` throws.
 */
export function toZoned(
    value: PlainDateTime,
    timeZone: string,
    disambiguation: Disambiguation = "compatible",
): ZonedDateTime {
    const wall = wallTime(value);
    const found = candidates(timeZone, wall);
    let instant: number;
    if (found.length === 1) {
        instant = found[0] as number;
    } else if (disambiguation === "reject") {
        throw new RangeError(
            `${toIsoDateTime(value)} is ${found.length === 0 ? "skipped" : "repeated"} in ${timeZone}`,
        );
    } else if (found.length === 2) {
        instant = (disambiguation === "later" ? found[1] : found[0]) as number;
    } else {
        // the offsets around the gap: before it (the earlier, smaller one east of UTC) and after
        const before = offsetAt(timeZone, wall - DAY);
        const after = offsetAt(timeZone, wall + DAY);
        instant = wall - (disambiguation === "earlier" ? after : before);
    }
    return fromInstant(instant, timeZone);
}

/** The same instant in another zone. */
export function toTimeZone(
    value: ZonedDateTime,
    timeZone: string,
): ZonedDateTime {
    return value.timeZone === timeZone
        ? value
        : fromInstant(toInstant(value), timeZone);
}

/** Negative when `a` is the earlier instant, positive when later, 0 when the same. */
export function compareZoned(a: ZonedDateTime, b: ZonedDateTime): number {
    return toInstant(a) - toInstant(b);
}

/**
 * Adds a duration as Temporal's `ZonedDateTime#add`: the years, months and days to the wall-clock
 * date (resolved `compatible`, so a day added across a DST change keeps its wall time), then the
 * time in exact time (an hour added across a gap is one real hour).
 */
export function addZoned(
    value: ZonedDateTime,
    duration: DateTimeDuration,
): ZonedDateTime {
    const { years, months, days, ...time } = duration;
    let result = value;
    if (years || months || days) {
        result = toZoned(
            addDate(value, years ?? 0, months ?? 0, days ?? 0),
            value.timeZone,
        );
    }
    const ms =
        (time.hours ?? 0) * HOUR +
        (time.minutes ?? 0) * 60_000 +
        (time.seconds ?? 0) * 1000 +
        (time.milliseconds ?? 0);
    return ms === 0
        ? result
        : fromInstant(toInstant(result) + ms, value.timeZone);
}

/**
 * Steps one time field and wraps within its range, carrying nothing (the date segments' and
 * React Aria's `cycle`): the hour walks the day's real hours (23 on a spring-forward day, 25 on a
 * fall-back one, the repeated hour twice); a minute or second keeps the offset it had when the
 * wall time still exists there, else resolves with `disambiguation`.
 */
export function cycleZoned(
    value: ZonedDateTime,
    field: Exclude<TimeField, "millisecond">,
    amount: number,
    disambiguation: Disambiguation = "compatible",
): ZonedDateTime {
    const { timeZone } = value;
    if (field === "hour") {
        const start = toInstant(
            toZoned(
                { ...value, hour: 0, minute: 0, second: 0, millisecond: 0 },
                timeZone,
            ),
        );
        const next = addDate(
            { ...value, hour: 0, minute: 0, second: 0, millisecond: 0 },
            0,
            0,
            1,
        );
        const end = toInstant(toZoned(next, timeZone));
        const hours = Math.round((end - start) / HOUR);
        const current = Math.floor((toInstant(value) - start) / HOUR);
        const target = (((current + amount) % hours) + hours) % hours;
        return fromInstant(
            toInstant(value) + (target - current) * HOUR,
            timeZone,
        );
    }
    const size = 60;
    const wall: PlainDateTime = {
        ...value,
        [field]: (((value[field] + amount) % size) + size) % size,
    };
    const instant = wallTime(wall) - value.offset;
    if (offsetAt(timeZone, instant) === value.offset) {
        return { ...wall, timeZone, offset: value.offset };
    }
    return toZoned(wall, timeZone, disambiguation);
}

/** `+05:30`, `-04:00` (`+00:00` for UTC); seconds only when the offset has them. */
export function toIsoOffset(offset: number): string {
    const sign = offset < 0 ? "-" : "+";
    const total = Math.round(Math.abs(offset) / 1000);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `${sign}${pad(hours)}:${pad(minutes)}${seconds ? `:${pad(seconds)}` : ""}`;
}

/**
 * `2026-03-08T03:30-04:00[America/New_York]` (RFC 9557, Temporal's `ZonedDateTime#toString`): the
 * wall time (see `toIsoDateTime` for `precision`), the offset and the zone.
 */
export function toIsoZoned(
    value: ZonedDateTime,
    precision: IsoTimePrecision = "auto",
): string {
    return `${toIsoDateTime(value, precision)}${toIsoOffset(value.offset)}[${value.timeZone}]`;
}

/**
 * Parses `YYYY-MM-DDTHH:MM[:SS[.sss]][±HH:MM][<zone>]`; the offset, when it is one the zone has
 * at that wall time, picks it (one of an overlap's two), else the wall time is resolved with
 * `disambiguation`. `null` when the text is not one, or its zone is unknown.
 */
export function fromIsoZoned(
    text: string,
    disambiguation: Disambiguation = "compatible",
): ZonedDateTime | null {
    const match = /^([^[]+?)(Z|[+-]\d{2}:\d{2}(?::\d{2})?)?\[([^\]]+)\]$/.exec(
        text,
    );
    if (match === null) {
        return null;
    }
    const wall = fromIsoDateTime(match[1] as string);
    const timeZone = match[3] as string;
    if (wall === null) {
        return null;
    }
    try {
        zoneFormat(timeZone);
    } catch {
        return null;
    }
    const offsetText = match[2];
    if (offsetText !== undefined && offsetText !== "Z") {
        const [hours, minutes, seconds] = offsetText
            .slice(1)
            .split(":")
            .map(Number);
        const offset =
            (offsetText[0] === "-" ? -1 : 1) *
            (((hours ?? 0) * 60 + (minutes ?? 0)) * 60 + (seconds ?? 0)) *
            1000;
        const instant = wallTime(wall) - offset;
        if (offsetAt(timeZone, instant) === offset) {
            return { ...wall, timeZone, offset };
        }
    }
    return toZoned(wall, timeZone, disambiguation);
}

/** The zone's name at the value's instant, from `Intl` (`timeZoneName`, default `short`: "EST"). */
export function formatTimeZoneName(
    locale: string,
    value: ZonedDateTime,
    style: Intl.DateTimeFormatOptions["timeZoneName"] = "short",
): string {
    return (
        new Intl.DateTimeFormat(locale, {
            timeZone: value.timeZone,
            timeZoneName: style,
        })
            .formatToParts(toInstant(value))
            .find((part) => part.type === "timeZoneName")
            ?.value.replace(/[   ]/g, " ") ?? value.timeZone
    );
}
