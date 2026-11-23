import { type PlainDate, toIsoDate } from "@fragiola/primitives/date";
import {
    isSegmentsComplete,
    type SegmentFormat,
    type SegmentGranularity,
    type SegmentKind,
    type SegmentValues,
    segmentsToDate,
    segmentsToDateTime,
    segmentsToTime,
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

/** A value's ISO text at the field's granularity (spec/date-field.md, "Forms"). */
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

/** Whether a value is out of `min` / `max`, or (a date) unavailable (spec/date-field.md). */
export function isOutOfRange(
    kind: SegmentKind,
    value: FieldValue,
    min: FieldValue | undefined,
    max: FieldValue | undefined,
    isDateUnavailable: ((date: PlainDate) => boolean) | undefined,
): boolean {
    return (
        (min !== undefined && compareValues(kind, value, min) < 0) ||
        (max !== undefined && compareValues(kind, value, max) > 0) ||
        (kind === "date" && isDateUnavailable?.(value as PlainDate) === true)
    );
}

/** The value complete segment values make (`null` while one is a placeholder). */
export function composeSegments(
    format: SegmentFormat,
    kind: SegmentKind,
    granularity: SegmentGranularity,
    values: SegmentValues,
): FieldValue | null {
    return !isSegmentsComplete(format, values)
        ? null
        : kind === "time"
          ? segmentsToTime(values)
          : granularity === "day"
            ? segmentsToDate(values)
            : segmentsToDateTime(values);
}

/** A bound's ISO text for a hidden input's `min` / `max` (`undefined` with none). */
export function boundIso(
    kind: SegmentKind,
    granularity: SegmentGranularity,
    edge: FieldValue | undefined,
): string | undefined {
    return edge === undefined ? undefined : isoOf(kind, granularity, edge);
}
