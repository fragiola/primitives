import {
    type EditableSegmentType,
    type SegmentFormat,
    type SegmentType,
    utcDate,
} from "./segment-format.ts";
import type { SegmentEdit } from "./segment-typing.ts";
import {
    type SegmentValues,
    segmentRange,
    shownValue,
} from "./segment-values.ts";

/** One segment as a field renders it (spec/date-field.md, "Segments"). */
export interface DateSegment {
    readonly type: SegmentType;
    /** Its place in the format: a stable key among the field's segments. */
    readonly index: number;
    /**
     * What it shows: its value as `Intl` writes it, the digits being typed, a placeholder (one
     * `–` per digit), or a literal's text.
     */
    readonly text: string;
    /** An editable segment (a `spinbutton`); literals and eras are not. */
    readonly editable: boolean;
    /** An editable segment with no value yet. */
    readonly placeholder: boolean;
    /** Its value in the unit it shows (`aria-valuenow`); `null` for a placeholder or a literal. */
    readonly value: number | null;
    readonly min: number | null;
    readonly max: number | null;
    /** `aria-valuetext`: its text, a month's name; `null` for a placeholder or a literal. */
    readonly valueText: string | null;
    /** Its name from `Intl.DisplayNames` ("month"), its default `aria-label`; `null` for none. */
    readonly label: string | null;
}

/** The text of a placeholder: one en dash per digit, two for a day period (no language). */
export const SEGMENT_PLACEHOLDER = "–";

function editable(
    format: SegmentFormat,
    type: SegmentType,
): type is EditableSegmentType {
    return (format.types as readonly SegmentType[]).includes(type);
}

/**
 * The values, completed where they are placeholders, as a UTC date `Intl` formats (a calendar
 * system's is its hook's): 2000 is a leap year, so a day set with no year keeps February 29.
 */
function sampleDate(format: SegmentFormat, values: SegmentValues): Date {
    const year = values.year ?? 2000;
    const month = values.month ?? 1;
    const last = utcDate(year, month + 1, 0).getUTCDate();
    return (
        format.calendar?.segmentSample(format, values) ??
        utcDate(
            year,
            month,
            Math.min(values.day ?? 1, last),
            values.hour ?? (values.dayPeriod === 1 ? 12 : 0),
            values.minute ?? 0,
            values.second ?? 0,
        )
    );
}

/**
 * The segments of a field (spec/date-field.md, "Segments"): its format's parts in order, each
 * editable one with its text, value, range, value text and name, the literals with their text.
 * `edit` shows the digits being typed into a segment that is not set yet (`0` of a month).
 */
export function dateSegments(
    format: SegmentFormat,
    values: SegmentValues,
    edit: SegmentEdit | null = null,
): DateSegment[] {
    const sample = sampleDate(format, values);
    const texts = new Map<string, string>();
    for (const part of format.formatter.formatToParts(sample)) {
        texts.set(part.type, part.value);
    }
    const local = (text: string) =>
        [...text]
            .map((digit) => format.digits[Number(digit)] ?? digit)
            .join("");
    return format.parts.map((part, index): DateSegment => {
        const { type } = part;
        const label = format.names[type] ?? null;
        if (!editable(format, type)) {
            return {
                type,
                index,
                // the zone's name at the values' time ("EST", "EDT": its hook), else the literal
                text:
                    format.timeZone?.segmentText(format, type, sample) ??
                    part.literal,
                editable: false,
                placeholder: false,
                value: null,
                min: null,
                max: null,
                valueText: null,
                label,
            };
        }
        const range = segmentRange(format, values, type);
        const value =
            type === "dayPeriod"
                ? values.dayPeriod
                : shownValue(format, values, type);
        // a placeholder shows the digits being typed, else one dash per digit
        const typing = edit?.type === type && edit.text !== "";
        const text =
            value === undefined
                ? typing
                    ? local((edit as SegmentEdit).text)
                    : SEGMENT_PLACEHOLDER.repeat(Math.max(range.digits, 2))
                : type === "dayPeriod"
                  ? (format.dayPeriods[value] ?? "")
                  : (texts.get(type) ?? local(String(value)));
        return {
            type,
            index,
            text,
            editable: true,
            placeholder: value === undefined && !typing,
            value: value ?? null,
            min: range.min,
            max: range.max,
            // a month's name in the sample's year (a calendar system's can depend on it)
            valueText:
                value === undefined
                    ? null
                    : type === "month"
                      ? format.monthNames.format(sample)
                      : text,
            label,
        };
    });
}
