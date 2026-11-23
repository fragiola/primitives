import { describe, expect, it } from "vitest";
import type { EditableSegmentType } from "../../src/segments/segment-format.ts";
import { segmentFormat } from "../../src/segments/segment-format.ts";
import {
    eraseSegment,
    type SegmentEdit,
    segmentDigit,
    typeSegment,
} from "../../src/segments/segment-typing.ts";
import type { SegmentValues } from "../../src/segments/segment-values.ts";

/** Types `keys` into one segment, as a field does, and returns where it ended. */
function type(
    locale: string,
    segment: EditableSegmentType,
    keys: string,
    options: {
        kind?: "date" | "time";
        values?: SegmentValues;
        hourCycle?: 12 | 24;
    } = {},
) {
    const format = segmentFormat({
        locale,
        kind: options.kind ?? "date",
        hourCycle: options.hourCycle,
    });
    let values = options.values ?? {};
    let edit: SegmentEdit | null = null;
    let advanced = false;
    for (const key of keys) {
        const result = typeSegment(format, values, segment, key, edit);
        if (result === null) {
            return { values, edit, advanced, refused: key };
        }
        values = result.values;
        edit = result.edit;
        advanced = result.advance;
    }
    return { values, edit, advanced, refused: null };
}

// spec/date-field.md, "Typing", per locale (the Epic's risk: order, digits, day period)
describe("typing digits", () => {
    it("continues a segment's digits and moves on once no digit could follow", () => {
        expect(type("en-US", "month", "1")).toMatchObject({
            values: { month: 1 },
            advanced: false,
        });
        expect(type("en-US", "month", "12")).toMatchObject({
            values: { month: 12 },
            advanced: true,
        });
        expect(type("en-US", "month", "4")).toMatchObject({
            values: { month: 4 },
            advanced: true,
        });
        expect(type("de-DE", "day", "3")).toMatchObject({ advanced: false });
        expect(type("de-DE", "day", "4")).toMatchObject({
            values: { day: 4 },
            advanced: true,
        });
        expect(type("ja-JP", "year", "2026")).toMatchObject({
            values: { year: 2026 },
            advanced: true,
        });
        expect(type("ja-JP", "year", "202")).toMatchObject({
            values: { year: 202 },
            advanced: false,
        });
    });

    it("starts again when the number would leave the segment's range", () => {
        // 1, then 3: month 13 is out of range, so 3 starts again (and completes it)
        expect(type("en-US", "month", "13")).toMatchObject({
            values: { month: 3 },
            advanced: true,
        });
        // a day of February stops at 29 with no year
        expect(
            type("en-US", "day", "3", { values: { month: 2 } }),
        ).toMatchObject({
            values: { month: 2, day: 3 },
            advanced: true,
        });
    });

    it("waits after a leading zero, which sets nothing yet", () => {
        const zero = type("en-US", "month", "0");
        expect(zero).toMatchObject({ values: {}, advanced: false });
        expect(zero.edit).toEqual({ type: "month", text: "0" });
        expect(type("en-US", "month", "05")).toMatchObject({
            values: { month: 5 },
            advanced: true,
        });
    });

    it("reads the locale's digits and the Arabic-Indic ones in every locale", () => {
        expect(type("ar-EG", "day", "٢٣")).toMatchObject({
            values: { day: 23 },
        });
        expect(type("ar-EG", "day", "23")).toMatchObject({
            values: { day: 23 },
        });
        expect(type("he-IL", "month", "۱۱")).toMatchObject({
            values: { month: 11 },
        });
        expect(type("en-US", "month", "x").refused).toBe("x");
        const format = segmentFormat({ locale: "ar-EG", kind: "date" });
        expect(segmentDigit(format, "٧")).toBe(7);
        expect(segmentDigit(format, "a")).toBeNull();
    });

    it("types an hour in the cycle it shows", () => {
        expect(type("en-US", "hour", "12", { kind: "time" })).toMatchObject({
            values: { hour: 0 },
            advanced: true,
        });
        expect(type("en-US", "hour", "2", { kind: "time" })).toMatchObject({
            values: { hour: 2 },
            advanced: true,
        });
        expect(
            type("en-US", "hour", "3", {
                kind: "time",
                values: { dayPeriod: 1 },
            }),
        ).toMatchObject({ values: { hour: 15, dayPeriod: 1 } });
        expect(type("de-DE", "hour", "23", { kind: "time" })).toMatchObject({
            values: { hour: 23 },
            advanced: true,
        });
        expect(type("de-DE", "hour", "2", { kind: "time" })).toMatchObject({
            values: { hour: 2 },
            advanced: false,
        });
        expect(
            type("ja-JP", "hour", "0", { kind: "time", hourCycle: 12 }),
        ).toMatchObject({ values: { hour: 0 }, advanced: false });
    });
});

describe("typing a day period", () => {
    it("takes the first letter of its AM or PM text, and moves a set hour", () => {
        const format = segmentFormat({ locale: "en-US", kind: "time" });
        const [am, pm] = format.dayPeriods;
        const pmKey = pm.charAt(0).toLowerCase();
        expect(
            typeSegment(format, { hour: 2 }, "dayPeriod", pmKey, null),
        ).toEqual({
            values: { hour: 14, dayPeriod: 1 },
            edit: null,
            advance: true,
        });
        expect(
            typeSegment(format, { hour: 14 }, "dayPeriod", am.charAt(0), null)
                ?.values,
        ).toEqual({ hour: 2, dayPeriod: 0 });
        expect(typeSegment(format, {}, "dayPeriod", "1", null)).toBeNull();
        expect(typeSegment(format, {}, "dayPeriod", " ", null)).toBeNull();
    });

    it("reads a locale's own day period letters", () => {
        const format = segmentFormat({ locale: "ar-EG", kind: "time" });
        const [, pm] = format.dayPeriods;
        expect(
            typeSegment(format, {}, "dayPeriod", pm.charAt(0), null)?.values,
        ).toEqual({ dayPeriod: 1 });
    });
});

describe("erasing", () => {
    const format = segmentFormat({ locale: "en-US", kind: "date" });

    it("removes the last digit, then the value, then moves back", () => {
        const first = eraseSegment(format, { year: 2026 }, "year", null);
        expect(first).toEqual({
            values: { year: 202 },
            edit: { type: "year", text: "202" },
            retreat: false,
        });
        const last = eraseSegment(format, { month: 1 }, "month", null);
        expect(last).toEqual({ values: {}, edit: null, retreat: false });
        expect(eraseSegment(format, {}, "month", null).retreat).toBe(true);
    });

    it("continues from the typed digits", () => {
        expect(
            eraseSegment(format, {}, "month", { type: "month", text: "0" }),
        ).toEqual({ values: {}, edit: null, retreat: false });
    });

    it("clears a day period at once", () => {
        const time = segmentFormat({ locale: "en-US", kind: "time" });
        expect(
            eraseSegment(time, { hour: 14, dayPeriod: 1 }, "dayPeriod", null),
        ).toEqual({ values: { hour: 14 }, edit: null, retreat: false });
        expect(
            eraseSegment(time, { hour: 14 }, "dayPeriod", null).retreat,
        ).toBe(true);
    });
});
