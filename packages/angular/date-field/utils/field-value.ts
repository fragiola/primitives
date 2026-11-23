import { type PlainDate, toIsoDate } from "@fragiola/primitives/date";
import type {
    SegmentGranularity,
    SegmentKind,
} from "@fragiola/primitives/segments";
import {
    compareDateTimes,
    compareTimes,
    type PlainDateTime,
    type PlainTime,
    toIsoDateTime,
    toIsoTime,
} from "@fragiola/primitives/time";

/** What a date or time field holds: a date, a date and time, or a time. */
export type FieldValue = PlainDate | PlainDateTime | PlainTime;

/** A value's ISO text at the field's granularity (spec/date-field.md, "Forms"); `""` for none. */
export function isoOf(
    kind: SegmentKind,
    granularity: SegmentGranularity,
    value: FieldValue | null | undefined,
): string {
    if (value == null) {
        return "";
    }
    const precision = granularity === "second" ? "second" : "minute";
    if (kind === "time") {
        return toIsoTime(value as PlainTime, precision);
    }
    if (granularity === "day") {
        return toIsoDate(value as PlainDate);
    }
    // a `PlainDate` bound counts as its midnight
    const {
        hour = 0,
        minute = 0,
        second = 0,
        millisecond = 0,
    } = value as Partial<PlainDateTime>;
    return toIsoDateTime(
        { ...(value as PlainDate), hour, minute, second, millisecond },
        precision,
    );
}

/** Orders two values of a field (a `PlainDate` counts as its midnight). */
export function compareValues(
    kind: SegmentKind,
    a: FieldValue,
    b: FieldValue,
): number {
    return kind === "time"
        ? compareTimes(a as PlainTime, b as PlainTime)
        : compareDateTimes(a as PlainDate, b as PlainDate);
}
