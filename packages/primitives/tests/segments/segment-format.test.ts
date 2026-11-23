import { describe, expect, it } from "vitest";
import { segmentFormat } from "../../src/segments/segment-format.ts";

// spec/date-field.md, "Segments": the format comes from Intl.DateTimeFormat#formatToParts. These
// tests assert the structure (order, cycle, digits), never a literal's exact text, which differs
// between engines and ICU versions (the Epic's risk)
describe("segmentFormat", () => {
    it("orders a date's segments as the locale writes them", () => {
        const order = (locale: string) =>
            segmentFormat({ locale, kind: "date" }).types;
        expect(order("en-US")).toEqual(["month", "day", "year"]);
        expect(order("de-DE")).toEqual(["day", "month", "year"]);
        expect(order("ja-JP")).toEqual(["year", "month", "day"]);
        expect(order("ar-EG")).toEqual(["day", "month", "year"]);
        expect(order("he-IL")).toEqual(["day", "month", "year"]);
    });

    it("keeps the literals between the segments, merged into one part each", () => {
        const { parts } = segmentFormat({ locale: "de-DE", kind: "date" });
        expect(parts.map((part) => part.type)).toEqual([
            "day",
            "literal",
            "month",
            "literal",
            "year",
        ]);
        expect(parts[1]?.literal).toContain(".");
        expect(parts[0]?.literal).toBe("");
    });

    it("adds the time down to the granularity, with the locale's hour cycle", () => {
        const enUs = segmentFormat({
            locale: "en-US",
            kind: "date",
            granularity: "minute",
        });
        expect(enUs.types).toEqual([
            "month",
            "day",
            "year",
            "hour",
            "minute",
            "dayPeriod",
        ]);
        expect(enUs.hourCycle).toBe("h12");
        const deDe = segmentFormat({
            locale: "de-DE",
            kind: "date",
            granularity: "second",
        });
        expect(deDe.types).toEqual([
            "day",
            "month",
            "year",
            "hour",
            "minute",
            "second",
        ]);
        expect(deDe.hourCycle).toBe("h23");
        expect(
            segmentFormat({
                locale: "en-US",
                kind: "time",
                granularity: "hour",
            }).types,
        ).toEqual(["hour", "dayPeriod"]);
    });

    it("takes a 12- or 24-hour cycle, or an exact one", () => {
        const ja12 = segmentFormat({
            locale: "ja-JP",
            kind: "time",
            hourCycle: 12,
        });
        // ja-JP writes its 12-hour clock 0–11, the day period first
        expect(ja12.hourCycle).toBe("h11");
        expect(ja12.types).toEqual(["dayPeriod", "hour", "minute"]);
        const en24 = segmentFormat({
            locale: "en-US",
            kind: "time",
            hourCycle: 24,
        });
        expect(en24.hourCycle).toBe("h23");
        expect(en24.types).toEqual(["hour", "minute"]);
        expect(
            segmentFormat({ locale: "en-US", kind: "time", hourCycle: "h24" })
                .hourCycle,
        ).toBe("h24");
        expect(
            segmentFormat({ locale: "en-US", kind: "date" }).hourCycle,
        ).toBeNull();
    });

    it("writes every literal space as U+0020, whatever the engine's ICU writes", () => {
        // en-US writes the space before AM/PM as U+202F in some ICU versions, U+0020 in others
        const { parts } = segmentFormat({ locale: "en-US", kind: "time" });
        for (const part of parts) {
            expect(part.literal).not.toMatch(/[\u00a0\u2007\u202f]/);
        }
        expect(parts.at(-2)).toEqual({ type: "literal", literal: " " });
    });

    it("reads a time's day granularity as minutes", () => {
        expect(
            segmentFormat({ locale: "de-DE", kind: "time", granularity: "day" })
                .granularity,
        ).toBe("minute");
    });

    it("has the locale's digits and day periods", () => {
        const arEg = segmentFormat({ locale: "ar-EG", kind: "time" });
        expect(arEg.digits).toEqual([..."٠١٢٣٤٥٦٧٨٩"]);
        expect(segmentFormat({ locale: "en-US", kind: "date" }).digits).toEqual(
            [..."0123456789"],
        );
        const enUs = segmentFormat({ locale: "en-US", kind: "time" });
        expect(enUs.dayPeriods[0]).not.toBe("");
        expect(enUs.dayPeriods[0]).not.toBe(enUs.dayPeriods[1]);
        expect(
            segmentFormat({ locale: "de-DE", kind: "time" }).dayPeriods,
        ).toEqual(["", ""]);
    });

    it("names the segments from Intl.DisplayNames", () => {
        const { names } = segmentFormat({ locale: "en-US", kind: "date" });
        expect(names.month).toBe(
            new Intl.DisplayNames("en-US", { type: "dateTimeField" }).of(
                "month",
            ),
        );
        expect(names.year).toBeTruthy();
        expect(
            segmentFormat({ locale: "de-DE", kind: "date" }).names.day,
        ).not.toBe(names.day);
    });
});
