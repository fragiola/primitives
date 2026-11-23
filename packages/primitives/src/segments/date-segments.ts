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

function editable(type: SegmentType): type is EditableSegmentType {
    return type !== "literal" && type !== "era";
}

/** The values, completed where they are placeholders, as a UTC date `Intl` formats. */
function sampleDate(values: SegmentValues): Date {
    // 2000 is a leap year: a day set with no year keeps February 29
    const year = values.year ?? 2000;
    const month = values.month ?? 1;
    const last = utcDate(year, month + 1, 0).getUTCDate();
    return utcDate(
        year,
        month,
        Math.min(values.day ?? 1, last),
        values.hour ?? (values.dayPeriod === 1 ? 12 : 0),
        values.minute ?? 0,
        values.second ?? 0,
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
    const texts = new Map<string, string>();
    for (const part of format.formatter.formatToParts(sampleDate(values))) {
        texts.set(part.type, part.value);
    }
    const local = (text: string) =>
        [...text]
            .map((digit) => format.digits[Number(digit)] ?? digit)
            .join("");
    return format.parts.map((part, index): DateSegment => {
        const { type } = part;
        if (!editable(type)) {
            return {
                type,
                index,
                text: part.literal,
                editable: false,
                placeholder: false,
                value: null,
                min: null,
                max: null,
                valueText: null,
                label: format.names[type] ?? null,
            };
        }
        const range = segmentRange(format, values, type);
        const value =
            type === "dayPeriod"
                ? (values.dayPeriod ?? undefined)
                : shownValue(format, values, type);
        const label = format.names[type] ?? null;
        if (value === undefined) {
            const typing = edit?.type === type && edit.text !== "";
            return {
                type,
                index,
                text: typing
                    ? local(edit.text)
                    : SEGMENT_PLACEHOLDER.repeat(Math.max(range.digits, 2)),
                editable: true,
                placeholder: !typing,
                value: null,
                min: range.min,
                max: range.max,
                valueText: null,
                label,
            };
        }
        const text =
            type === "dayPeriod"
                ? (format.dayPeriods[value] ?? "")
                : (texts.get(type) ?? local(String(value)));
        return {
            type,
            index,
            text,
            editable: true,
            placeholder: false,
            value,
            min: range.min,
            max: range.max,
            valueText:
                type === "month"
                    ? format.monthNames.format(utcDate(2000, value, 1))
                    : text,
            label,
        };
    });
}
