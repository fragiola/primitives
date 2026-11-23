import { describe, expect, it } from "vitest";
import {
    dateSegments,
    SEGMENT_PLACEHOLDER,
} from "../../src/segments/date-segments.ts";
import { segmentFormat } from "../../src/segments/segment-format.ts";

// spec/date-field.md, "Segments": what a field renders
describe("dateSegments", () => {
    it("renders placeholders, with no value, and the literals between", () => {
        const format = segmentFormat({ locale: "en-US", kind: "date" });
        const segments = dateSegments(format, {});
        expect(segments.map((segment) => segment.type)).toEqual([
            "month",
            "literal",
            "day",
            "literal",
            "year",
        ]);
        expect(segments.map((segment) => segment.index)).toEqual([
            0, 1, 2, 3, 4,
        ]);
        const [month, slash, , , year] = segments;
        expect(month).toMatchObject({
            editable: true,
            placeholder: true,
            value: null,
            valueText: null,
            min: 1,
            max: 12,
            text: SEGMENT_PLACEHOLDER.repeat(2),
        });
        expect(year?.text).toBe(SEGMENT_PLACEHOLDER.repeat(4));
        expect(slash).toMatchObject({
            editable: false,
            placeholder: false,
            value: null,
        });
        expect(month?.label).toBe(format.names.month);
    });

    it("writes set segments as Intl does, a month's value text its name", () => {
        const format = segmentFormat({ locale: "en-US", kind: "date" });
        const segments = dateSegments(format, {
            year: 2026,
            month: 11,
            day: 5,
        });
        const month = segments.find((segment) => segment.type === "month");
        const day = segments.find((segment) => segment.type === "day");
        expect(month).toMatchObject({
            value: 11,
            text: "11",
            placeholder: false,
        });
        expect(month?.valueText).toBe(
            new Intl.DateTimeFormat("en-US", {
                month: "long",
                timeZone: "UTC",
            }).format(Date.UTC(2026, 10, 1)),
        );
        expect(day).toMatchObject({ value: 5, text: "5", valueText: "5" });
    });

    it("writes the locale's digits", () => {
        const format = segmentFormat({ locale: "ar-EG", kind: "date" });
        const segments = dateSegments(format, { day: 23 }, null);
        expect(segments[0]).toMatchObject({
            type: "day",
            value: 23,
            text: "٢٣",
        });
        // the digits being typed, in the locale's digits
        const typing = dateSegments(format, {}, { type: "month", text: "0" });
        expect(typing[2]).toMatchObject({
            type: "month",
            text: "٠",
            placeholder: false,
            value: null,
        });
    });

    it("shows a 12-hour time with its day period, two-digit minutes", () => {
        const format = segmentFormat({ locale: "en-US", kind: "time" });
        const segments = dateSegments(format, {
            hour: 14,
            minute: 5,
            dayPeriod: 1,
        });
        const byType = Object.fromEntries(
            segments.map((segment) => [segment.type, segment]),
        );
        expect(byType.hour).toMatchObject({
            value: 2,
            text: "2",
            min: 1,
            max: 12,
        });
        expect(byType.minute).toMatchObject({ value: 5, text: "05" });
        expect(byType.dayPeriod).toMatchObject({
            value: 1,
            text: format.dayPeriods[1],
            min: 0,
            max: 1,
        });
        // an hour set before its day period: the day period is still a placeholder
        const pending = dateSegments(format, { hour: 14 });
        expect(
            pending.find((segment) => segment.type === "dayPeriod"),
        ).toMatchObject({
            placeholder: true,
        });
    });

    it("shows a 24-hour time in its locale's order", () => {
        const format = segmentFormat({
            locale: "he-IL",
            kind: "time",
            granularity: "second",
        });
        const segments = dateSegments(format, {
            hour: 9,
            minute: 5,
            second: 0,
        });
        expect(
            segments
                .filter((segment) => segment.editable)
                .map((segment) => segment.text),
        ).toEqual(
            new Intl.DateTimeFormat("he-IL", {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                timeZone: "UTC",
            })
                .formatToParts(Date.UTC(2026, 0, 1, 9, 5, 0))
                .filter((part) => part.type !== "literal")
                .map((part) => part.value),
        );
    });
});
