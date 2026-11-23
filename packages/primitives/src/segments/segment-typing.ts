import type { EditableSegmentType, SegmentFormat } from "./segment-format.ts";
import {
    type SegmentValues,
    segmentRange,
    setSegment,
    shownValue,
} from "./segment-values.ts";

/**
 * The digits typed into the focused segment so far (ASCII), so the next digit continues them
 * (`1` then `2` is month 12). A field keeps it while the segment stays focused, and drops it on
 * blur, a step or a move.
 */
export interface SegmentEdit {
    readonly type: EditableSegmentType;
    readonly text: string;
}

export interface SegmentTypeResult {
    readonly values: SegmentValues;
    /** What to keep for the next key; `null` once the segment is complete. */
    readonly edit: SegmentEdit | null;
    /** The segment is complete: focus moves on to the next one. */
    readonly advance: boolean;
}

export interface SegmentEraseResult {
    readonly values: SegmentValues;
    readonly edit: SegmentEdit | null;
    /** The segment was already empty: focus moves back to the previous one. */
    readonly retreat: boolean;
}

// ASCII, Arabic-Indic and Extended Arabic-Indic digits read in every locale (as NumberField's)
const SHARED_DIGITS = ["0123456789", "٠١٢٣٤٥٦٧٨٩", "۰۱۲۳۴۵۶۷۸۹"];

/** The digit a character is in the locale's numbering system or a shared one; `null` for none. */
export function segmentDigit(
    format: SegmentFormat,
    character: string,
): number | null {
    for (const digits of SHARED_DIGITS) {
        const index = digits.indexOf(character);
        if (index >= 0 && character.length === 1) {
            return index;
        }
    }
    const index = format.digits.indexOf(character);
    return index >= 0 ? index : null;
}

/**
 * Types one character into a segment (spec/date-field.md, "Typing"). A digit continues the
 * segment's typed digits, or starts again when the number would leave the range; the segment is
 * set once the number is in range (`0` alone in a month waits for the next digit), and complete
 * (`advance`) when no further digit could fit: `4` in a month, `12`, or a year's fourth digit. A
 * day period takes a letter: the first letter of its AM or PM text. Anything else is refused
 * (`null`).
 */
export function typeSegment(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
    character: string,
    edit: SegmentEdit | null,
    seed: SegmentValues = {},
): SegmentTypeResult | null {
    if (type === "dayPeriod") {
        const key = character.toLocaleLowerCase(format.locale);
        const index = format.dayPeriods.findIndex(
            (text) =>
                text !== "" &&
                text.toLocaleLowerCase(format.locale).startsWith(key),
        );
        if (index < 0 || key.trim() === "") {
            return null;
        }
        return {
            values: setSegment(format, values, type, index, seed),
            edit: null,
            advance: true,
        };
    }
    const digit = segmentDigit(format, character);
    if (digit === null) {
        return null;
    }
    const range = segmentRange(format, values, type);
    let text = `${edit?.type === type ? edit.text : ""}${digit}`;
    if (text.length > range.digits || Number(text) > range.max) {
        text = String(digit);
    }
    const number = Number(text);
    const next =
        number >= range.min && number <= range.max
            ? setSegment(format, values, type, number, seed)
            : setSegment(format, values, type, undefined);
    const advance =
        text.length >= range.digits || Number(`${text}0`) > range.max;
    return {
        values: next,
        edit: advance ? null : { type, text },
        advance: advance && next[type] !== undefined,
    };
}

/**
 * Backspace (or Delete) in a segment: removes its last digit (a day period is cleared at once);
 * a segment left with no digit is a placeholder. An empty segment reports `retreat`.
 */
export function eraseSegment(
    format: SegmentFormat,
    values: SegmentValues,
    type: EditableSegmentType,
    edit: SegmentEdit | null,
): SegmentEraseResult {
    if (type === "dayPeriod") {
        return values.dayPeriod === undefined
            ? { values, edit: null, retreat: true }
            : {
                  values: setSegment(format, values, type, undefined),
                  edit: null,
                  retreat: false,
              };
    }
    const shown = shownValue(format, values, type);
    const current =
        edit?.type === type
            ? edit.text
            : shown === undefined
              ? ""
              : String(shown);
    if (current === "") {
        return { values, edit: null, retreat: true };
    }
    const text = current.slice(0, -1);
    if (text === "") {
        return {
            values: setSegment(format, values, type, undefined),
            edit: null,
            retreat: false,
        };
    }
    const range = segmentRange(format, values, type);
    const number = Number(text);
    return {
        values: setSegment(
            format,
            values,
            type,
            number >= range.min && number <= range.max ? number : undefined,
        ),
        edit: { type, text },
        retreat: false,
    };
}
