import {
    type EditableSegmentType,
    type SegmentFormat,
    type SegmentType,
    utcDate,
} from "./segment-format.ts";
import type { SegmentEdit } from "./segment-typing.ts";
import {
    calendarYear,
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
 * The values' date, completed where they are placeholders: 2000 is a leap year, so a day set with
 * no year keeps February 29 (a calendar system's longest year; an era set with no year its second
 * year, wholly in it).
 */
function sampleDay(
    format: SegmentFormat,
    values: SegmentValues,
): { year: number; month: number; day: number } {
    const { calendar } = format;
    if (calendar) {
        const year =
            calendarYear(format, values) ??
            (values.era === undefined
                ? calendar.referenceYear()
                : calendar.yearOfEra(values.era, 2));
        return calendar.fromFields({
            year,
            month: values.month ?? 1,
            day: values.day ?? 1,
        });
    }
    const year = values.year ?? 2000;
    const month = values.month ?? 1;
    const last = utcDate(year, month + 1, 0).getUTCDate();
    return { year, month, day: Math.min(values.day ?? 1, last) };
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
    const day = sampleDay(format, values);
    const time = {
        hour: values.hour ?? (values.dayPeriod === 1 ? 12 : 0),
        minute: values.minute ?? 0,
        second: values.second ?? 0,
    };
    const texts = new Map<string, string>();
    for (const part of format.formatter.formatToParts(
        utcDate(
            day.year,
            day.month,
            day.day,
            time.hour,
            time.minute,
            time.second,
        ),
    )) {
        texts.set(part.type, part.value);
    }
    const { timeZone } = format;
    const local = (text: string) =>
        [...text]
            .map((digit) => format.digits[Number(digit)] ?? digit)
            .join("");
    return format.parts.map((part, index): DateSegment => {
        const { type } = part;
        if (!editable(format, type)) {
            return {
                type,
                index,
                // the zone's name at the values' time ("EST", "EDT"), else the literal's text
                text:
                    type === "timeZoneName" && timeZone
                        ? timeZone.name(
                              format.locale,
                              timeZone.resolve(
                                  { ...day, ...time, millisecond: 0 },
                                  format.disambiguation === "reject"
                                      ? "compatible"
                                      : format.disambiguation,
                              ),
                          )
                        : part.literal,
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
                    ? format.monthNames.format(
                          format.calendar
                              ? utcDate(day.year, day.month, day.day)
                              : utcDate(2000, value, 1),
                      )
                    : text,
            label,
        };
    });
}
