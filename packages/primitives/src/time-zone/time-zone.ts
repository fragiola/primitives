import type { PlainDateTime } from "../time/plain-date-time.ts";
import type { IsoTimePrecision } from "../time/plain-time.ts";
import {
    type Disambiguation,
    formatTimeZoneName,
    fromInstant,
    localTimeZone,
    toIsoZoned,
    toTimeZone,
    toZoned,
    type ZonedDateTime,
} from "./zoned-date-time.ts";

/**
 * A time zone as a date field or picker takes it (spec/time-zones.md, "In the fields"): its id and
 * the zoned math the field calls. A field given one holds `ZonedDateTime` values in that zone;
 * no component imports `/time-zone`, so a field given none bundles none of it.
 */
export interface TimeZone {
    /** The IANA id (`America/New_York`). */
    readonly id: string;
    /** A wall-clock date and time in this zone, resolved with `disambiguation`. */
    resolve(
        value: PlainDateTime,
        disambiguation?: Disambiguation,
    ): ZonedDateTime;
    /** The same instant in this zone. */
    convert(value: ZonedDateTime): ZonedDateTime;
    /** The date and time of an instant (epoch milliseconds or a `Date`) in this zone. */
    at(instant: number | Date): ZonedDateTime;
    /** The zone's short name at the value's instant ("EST", "GMT+5:30"), from `Intl`. */
    name(locale: string, value: ZonedDateTime): string;
    /** The value's ISO text with its offset and zone (what a form submits). */
    toIso(value: ZonedDateTime, precision?: IsoTimePrecision): string;
}

/** The time zone `id` (default: the page's own) for a date field or picker's `timeZone`. */
export function timeZone(id: string = localTimeZone()): TimeZone {
    return {
        id,
        resolve: (value, disambiguation) => toZoned(value, id, disambiguation),
        convert: (value) => toTimeZone(value, id),
        at: (instant) => fromInstant(instant, id),
        name: (locale, value) => formatTimeZoneName(locale, value),
        toIso: toIsoZoned,
    };
}
