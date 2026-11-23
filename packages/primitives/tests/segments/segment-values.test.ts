import { describe, expect, it } from "vitest";
import { segmentFormat } from "../../src/segments/segment-format.ts";
import {
    isSegmentsComplete,
    segmentRange,
    segmentsToDate,
    segmentsToDateTime,
    segmentsToTime,
    segmentToEdge,
    segmentValuesOf,
    setSegment,
    stepSegment,
} from "../../src/segments/segment-values.ts";

const date = segmentFormat({ locale: "en-US", kind: "date" });
const time12 = segmentFormat({ locale: "en-US", kind: "time" });
const time24 = segmentFormat({
    locale: "de-DE",
    kind: "time",
    granularity: "second",
});
const time11 = segmentFormat({ locale: "ja-JP", kind: "time", hourCycle: 12 });

// spec/date-field.md, "Keyboard" and "Editing"
describe("segment ranges", () => {
    it("bounds each segment, a day by its month and year", () => {
        expect(segmentRange(date, {}, "year")).toEqual({
            min: 1,
            max: 9999,
            digits: 4,
        });
        expect(segmentRange(date, {}, "day").max).toBe(31);
        expect(segmentRange(date, { month: 2 }, "day").max).toBe(29);
        expect(segmentRange(date, { month: 2, year: 2026 }, "day").max).toBe(
            28,
        );
        expect(segmentRange(date, { month: 11 }, "day").max).toBe(30);
        expect(segmentRange(time12, {}, "hour")).toMatchObject({
            min: 1,
            max: 12,
        });
        expect(segmentRange(time11, {}, "hour")).toMatchObject({
            min: 0,
            max: 11,
        });
        expect(segmentRange(time24, {}, "hour")).toMatchObject({
            min: 0,
            max: 23,
        });
        expect(segmentRange(time24, {}, "second")).toMatchObject({
            min: 0,
            max: 59,
        });
    });
});

describe("stepping", () => {
    it("wraps within the segment and carries nothing", () => {
        expect(
            stepSegment(date, { month: 12, year: 2026 }, "month", 1),
        ).toEqual({
            month: 1,
            year: 2026,
        });
        expect(stepSegment(date, { day: 1, month: 11 }, "day", -1)).toEqual({
            day: 30,
            month: 11,
        });
        expect(stepSegment(time24, { minute: 50 }, "minute", 15)).toEqual({
            minute: 5,
        });
        expect(stepSegment(time24, { hour: 0 }, "hour", -1)).toEqual({
            hour: 23,
        });
    });

    it("gives a placeholder the seed's value, with no step", () => {
        const seed = { year: 2026, month: 11, day: 20 };
        expect(stepSegment(date, {}, "month", 1, seed)).toEqual({ month: 11 });
        expect(stepSegment(date, {}, "year", -5, seed)).toEqual({ year: 2026 });
        // no seed: the segment's minimum
        expect(stepSegment(date, {}, "day", 1)).toEqual({ day: 1 });
        expect(stepSegment(time12, {}, "hour", 1)).toEqual({ hour: 0 });
    });

    it("keeps a 12-hour cycle's hour in its half of the day", () => {
        // 11 AM + 1 is 12 AM (midnight), as React Aria's cycle
        expect(stepSegment(time12, { hour: 11 }, "hour", 1)).toEqual({
            hour: 0,
        });
        expect(
            stepSegment(time12, { hour: 12, dayPeriod: 1 }, "hour", -1),
        ).toEqual({
            hour: 23,
            dayPeriod: 1,
        });
        expect(stepSegment(time11, { hour: 23 }, "hour", 1)).toEqual({
            hour: 12,
        });
    });

    it("toggles the day period, moving a set hour with it", () => {
        expect(
            stepSegment(time12, { hour: 9, dayPeriod: 0 }, "dayPeriod", 1),
        ).toEqual({
            hour: 21,
            dayPeriod: 1,
        });
        expect(
            stepSegment(time12, { hour: 21, dayPeriod: 1 }, "dayPeriod", -1),
        ).toEqual({
            hour: 9,
            dayPeriod: 0,
        });
        // a placeholder day period starts in the hour's half
        expect(stepSegment(time12, { hour: 15 }, "dayPeriod", 1)).toEqual({
            hour: 15,
            dayPeriod: 1,
        });
    });

    it("goes to the edges", () => {
        expect(
            segmentToEdge(date, { month: 2, year: 2026 }, "day", "max"),
        ).toEqual({
            month: 2,
            year: 2026,
            day: 28,
        });
        expect(segmentToEdge(time12, { dayPeriod: 1 }, "hour", "min")).toEqual({
            dayPeriod: 1,
            hour: 13,
        });
        expect(segmentToEdge(time12, {}, "hour", "max")).toEqual({ hour: 0 });
    });
});

describe("setting", () => {
    it("clamps a day into its month once the month or year changes", () => {
        expect(setSegment(date, { day: 31 }, "month", 2)).toEqual({
            day: 29,
            month: 2,
        });
        expect(setSegment(date, { day: 29, month: 2 }, "year", 2026)).toEqual({
            day: 28,
            month: 2,
            year: 2026,
        });
    });

    it("reads a 12-hour hour in the day period set, else the seed's", () => {
        expect(setSegment(time12, { dayPeriod: 1 }, "hour", 3)).toEqual({
            dayPeriod: 1,
            hour: 15,
        });
        expect(setSegment(time12, {}, "hour", 12)).toEqual({ hour: 0 });
        expect(setSegment(time12, {}, "hour", 3, { hour: 18 })).toEqual({
            hour: 15,
        });
        expect(setSegment(time24, {}, "hour", 15)).toEqual({ hour: 15 });
    });
});

describe("values", () => {
    it("is complete once every segment is set, a day period included", () => {
        expect(isSegmentsComplete(date, { year: 2026, month: 11 })).toBe(false);
        expect(
            isSegmentsComplete(date, { year: 2026, month: 11, day: 23 }),
        ).toBe(true);
        expect(isSegmentsComplete(time12, { hour: 14, minute: 30 })).toBe(
            false,
        );
        expect(
            isSegmentsComplete(time12, { hour: 14, minute: 30, dayPeriod: 1 }),
        ).toBe(true);
    });

    it("splits a value into the format's segments, and back", () => {
        const dateTime = segmentFormat({
            locale: "en-US",
            kind: "date",
            granularity: "minute",
        });
        const value = {
            year: 2026,
            month: 11,
            day: 23,
            hour: 14,
            minute: 30,
            second: 9,
            millisecond: 0,
        };
        const values = segmentValuesOf(dateTime, value);
        expect(values).toEqual({
            year: 2026,
            month: 11,
            day: 23,
            hour: 14,
            minute: 30,
            dayPeriod: 1,
        });
        // the field's granularity: no seconds
        expect(segmentsToDateTime(values)).toEqual({ ...value, second: 0 });
        expect(segmentsToDate(values)).toEqual({
            year: 2026,
            month: 11,
            day: 23,
        });
        expect(segmentsToTime({ hour: 9 })).toEqual({
            hour: 9,
            minute: 0,
            second: 0,
            millisecond: 0,
        });
        expect(segmentsToDate({ year: 2026 })).toBeNull();
        expect(segmentsToTime({})).toBeNull();
        expect(segmentValuesOf(date, null)).toEqual({});
    });
});
