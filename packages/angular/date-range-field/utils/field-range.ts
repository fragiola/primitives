import type { PlainDate } from "@fragiola/primitives/date";
import type {
    SegmentGranularity,
    SegmentKind,
} from "@fragiola/primitives/segments";
import type { TimeZone } from "@fragiola/primitives/time-zone";
import {
    compareValues,
    type FieldValue,
    isOutOfRange,
    isoOf,
} from "@fragiola/primitives-angular/date-field";

/** One end of a range: the Input that holds its segments (spec/date-range-field.md). */
export type RangeEnd = "start" | "end";

/** A range of field values: two dates, two dates and times, or two times. */
export interface FieldRange<Value extends FieldValue = FieldValue> {
    readonly start: Value;
    readonly end: Value;
}

/** A range's ISO text (`start/end`), empty with none: what the reports compare. */
export function rangeIso(
    kind: SegmentKind,
    granularity: SegmentGranularity,
    range: FieldRange | null | undefined,
    timeZone?: TimeZone,
): string {
    return range == null
        ? ""
        : `${isoOf(kind, granularity, range.start, timeZone)}/${isoOf(kind, granularity, range.end, timeZone)}`;
}

/**
 * Whether a range is invalid (spec/date-range-field.md, "Validation"): an end out of range or
 * unavailable, or the end before the start.
 */
export function isRangeInvalid(
    kind: SegmentKind,
    range: FieldRange,
    min: FieldValue | null | undefined,
    max: FieldValue | null | undefined,
    isDateUnavailable: ((date: PlainDate) => boolean) | undefined,
): boolean {
    return (
        isOutOfRange(kind, range.start, min, max, isDateUnavailable) ||
        isOutOfRange(kind, range.end, min, max, isDateUnavailable) ||
        compareValues(kind, range.end, range.start) < 0
    );
}

/** The range two ends' values make, `null` while either is incomplete. */
export function composeRange(
    start: FieldValue | null,
    end: FieldValue | null,
): FieldRange | null {
    return start === null || end === null ? null : { start, end };
}

/** The earlier (`edge` -1) or later (1) of two optional values. */
export function edgeOf(
    kind: SegmentKind,
    a: FieldValue | null | undefined,
    b: FieldValue | null | undefined,
    edge: -1 | 1,
): FieldValue | null {
    if (a == null || b == null) {
        return a ?? b ?? null;
    }
    return Math.sign(compareValues(kind, a, b)) === edge ? a : b;
}
