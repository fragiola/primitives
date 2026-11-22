import { describe, expect, it } from "vitest";
import { progressValue } from "../../src/range/progress.ts";

describe("progressValue", () => {
    it("writes the value as a percentage of the range by default", () => {
        expect(progressValue(40, { locale: "en-US" })).toEqual({
            value: 40,
            percent: 40,
            status: "progressing",
            formattedValue: "40%",
        });
        expect(
            progressValue(128, { max: 512, locale: "en-US" }).formattedValue,
        ).toBe("25%");
        expect(
            progressValue(15, { min: 10, max: 20, locale: "en-US" }).percent,
        ).toBe(50);
    });

    it("writes the value itself with a format, in its locale", () => {
        const storage = progressValue(128, {
            max: 512,
            format: { style: "unit", unit: "gigabyte" },
            locale: "en-US",
        });
        expect(storage.formattedValue).toBe("128 GB");
        expect(storage.percent).toBe(25);
        expect(
            progressValue(1234.5, {
                max: 2000,
                format: { maximumFractionDigits: 1 },
                locale: "de-DE",
            }).formattedValue,
        ).toBe("1.234,5");
    });

    it("clamps the value, and is complete at max", () => {
        expect(progressValue(150, { locale: "en-US" })).toMatchObject({
            value: 100,
            percent: 100,
            status: "complete",
            formattedValue: "100%",
        });
        expect(progressValue(-5, { locale: "en-US" })).toMatchObject({
            value: 0,
            percent: 0,
            status: "progressing",
        });
    });

    it("is indeterminate with no value, and writes nothing", () => {
        expect(progressValue(null)).toEqual({
            value: null,
            percent: null,
            status: "indeterminate",
            formattedValue: "",
        });
    });

    it("puts an empty range at its start", () => {
        expect(progressValue(5, { min: 5, max: 5 }).percent).toBe(0);
    });
});
