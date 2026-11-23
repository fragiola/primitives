import type { PlainDate } from "../date/plain-date.ts";
import type {
    SegmentFormat,
    SegmentFormatOptions,
    SegmentType,
} from "../segments/segment-format.ts";
import type { PlainDateTime } from "../time/plain-date-time.ts";
import type { IsoTimePrecision, PlainTime } from "../time/plain-time.ts";
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
    /**
     * A wall time chosen (a picker's date, a segment's sample): resolved with `disambiguation`,
     * `reject` read as `compatible`, so a choice always has a value.
     */
    choose(
        value: PlainDateTime,
        disambiguation?: Disambiguation,
    ): ZonedDateTime;
    // The segments' hooks (`/segments` calls them through a format's `timeZone`, which is this
    // zone): a field given no zone bundles none of them.
    /** A value as this zone's wall time: a zoned one from another zone at its instant here. */
    wallTime<Value extends Partial<PlainDateTime>>(value: Value): Value;
    /**
     * The text of a part the zone writes: its name segment's (`timeZoneName`) at a sample's wall
     * time (its UTC fields); `undefined` for any other part.
     */
    segmentText(
        format: SegmentFormat,
        type: SegmentType,
        sample: Date,
    ): string | undefined;
    /** The zoned value of a typed wall time, with the format's `disambiguation` (`null`: rejected). */
    segmentsToDateTime(
        format: SegmentFormat,
        date: PlainDate,
        time: PlainTime,
    ): ZonedDateTime | null;
    /** The Intl options of a field's format, with the zone's name where a date and time shows it. */
    segmentOptions(
        options: SegmentFormatOptions,
        intl: Intl.DateTimeFormatOptions,
    ): Intl.DateTimeFormatOptions;
}

/** The time zone `id` (default: the page's own) for a date field or picker's `timeZone`. */
export function timeZone(id: string = localTimeZone()): TimeZone {
    const choose = (value: PlainDateTime, disambiguation?: Disambiguation) =>
        toZoned(
            value,
            id,
            disambiguation === "reject" ? "compatible" : disambiguation,
        );
    return {
        id,
        resolve: (value, disambiguation) => toZoned(value, id, disambiguation),
        convert: (value) => toTimeZone(value, id),
        at: (instant) => fromInstant(instant, id),
        name: (locale, value) => formatTimeZoneName(locale, value),
        toIso: toIsoZoned,
        choose,
        // where the locale writes it; its text is the field's zone's (`segmentText`)
        segmentOptions: (options, intl) =>
            options.hideTimeZone || !intl.year || !intl.hour
                ? intl
                : { ...intl, timeZoneName: "short" },
        wallTime: (value) =>
            "offset" in value && "timeZone" in value
                ? (toTimeZone(value as unknown as ZonedDateTime, id) as never)
                : value,
        segmentText: (format, type, sample) =>
            type !== "timeZoneName"
                ? undefined
                : formatTimeZoneName(
                      format.locale,
                      choose(
                          {
                              year: sample.getUTCFullYear(),
                              month: sample.getUTCMonth() + 1,
                              day: sample.getUTCDate(),
                              hour: sample.getUTCHours(),
                              minute: sample.getUTCMinutes(),
                              second: sample.getUTCSeconds(),
                              millisecond: 0,
                          },
                          format.disambiguation,
                      ),
                  ),
        segmentsToDateTime: (format, date, time) => {
            try {
                return toZoned({ ...date, ...time }, id, format.disambiguation);
            } catch {
                return null;
            }
        },
    };
}
