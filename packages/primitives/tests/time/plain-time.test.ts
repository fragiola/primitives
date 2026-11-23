import { describe, expect, it } from "vitest";
import {
    addTime,
    compareTimes,
    currentTime,
    cycleTime,
    fromIsoTime,
    isSameTime,
    plainTime,
    toIsoTime,
} from "../../src/time/plain-time.ts";

// spec/date-field.md, "Values": a wall-clock time, no date, no time zone
describe("plainTime", () => {
    it("builds a time and wraps overflow around midnight", () => {
        expect(plainTime(14, 30)).toEqual({
            hour: 14,
            minute: 30,
            second: 0,
            millisecond: 0,
        });
        expect(plainTime(25)).toEqual(plainTime(1));
        expect(plainTime(0, -1)).toEqual(plainTime(23, 59));
        expect(plainTime(23, 59, 59, 1000)).toEqual(plainTime(0));
    });

    it("reads the clock it is given", () => {
        expect(currentTime(new Date(2026, 10, 23, 9, 5, 7, 12))).toEqual(
            plainTime(9, 5, 7, 12),
        );
    });

    it("compares times", () => {
        expect(compareTimes(plainTime(9), plainTime(10))).toBeLessThan(0);
        expect(
            compareTimes(plainTime(10, 0, 1), plainTime(10)),
        ).toBeGreaterThan(0);
        expect(isSameTime(plainTime(10), plainTime(10, 0, 0, 0))).toBe(true);
        expect(isSameTime(plainTime(10), null)).toBe(false);
    });

    it("adds with a carry, and cycles one field with none", () => {
        expect(addTime(plainTime(23, 30), { hours: 1 })).toEqual(
            plainTime(0, 30),
        );
        expect(addTime(plainTime(10, 59), { minutes: 2 })).toEqual(
            plainTime(11, 1),
        );
        expect(addTime(plainTime(0, 10), { minutes: -20 })).toEqual(
            plainTime(23, 50),
        );
        expect(cycleTime(plainTime(10, 59), "minute", 1)).toEqual(
            plainTime(10, 0),
        );
        expect(cycleTime(plainTime(0, 15), "hour", -1)).toEqual(
            plainTime(23, 15),
        );
        expect(cycleTime(plainTime(0, 0, 5), "second", -10)).toEqual(
            plainTime(0, 0, 55),
        );
    });
});

describe("ISO times", () => {
    it("writes the shortest exact form by default, or a fixed precision", () => {
        expect(toIsoTime(plainTime(14, 30))).toBe("14:30");
        expect(toIsoTime(plainTime(9, 5, 7))).toBe("09:05:07");
        expect(toIsoTime(plainTime(9, 5, 7, 120))).toBe("09:05:07.120");
        expect(toIsoTime(plainTime(14, 30), "second")).toBe("14:30:00");
        expect(toIsoTime(plainTime(14, 30, 5, 9), "minute")).toBe("14:30");
        expect(toIsoTime(plainTime(14, 30), "millisecond")).toBe(
            "14:30:00.000",
        );
    });

    it("parses HH:MM[:SS[.sss]] and refuses anything else", () => {
        expect(fromIsoTime("14:30")).toEqual(plainTime(14, 30));
        expect(fromIsoTime("09:05:07")).toEqual(plainTime(9, 5, 7));
        expect(fromIsoTime("09:05:07.1")).toEqual(plainTime(9, 5, 7, 100));
        expect(fromIsoTime("09:05:07.123")).toEqual(plainTime(9, 5, 7, 123));
        for (const text of [
            "24:00",
            "12:60",
            "9:05",
            "12:00:61",
            "12:00:00.1234",
            "",
        ]) {
            expect(fromIsoTime(text)).toBeNull();
        }
    });
});
