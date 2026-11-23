import { describe, expect, it } from "vitest";
import { formatNumber } from "../../src/number/number-format.ts";
import { isNumberText, parseNumber } from "../../src/number/number-parse.ts";

// spec/number-field.md, "Typing": the localized text a field reads (the Epic's risk: grouping,
// decimal separators, non-Latin digits), unit-tested per locale
const EUR = { style: "currency", currency: "EUR" } as const;
const PERCENT = { style: "percent" } as const;

describe("parseNumber", () => {
    it("reads en-US: the comma groups, the point is decimal", () => {
        const locale = "en-US";
        expect(parseNumber("1,234.5", { locale })).toBe(1234.5);
        expect(parseNumber("1234", { locale })).toBe(1234);
        expect(parseNumber("-12.25", { locale })).toBe(-12.25);
        expect(parseNumber(".5", { locale })).toBe(0.5);
        expect(parseNumber("€1,234.50", { locale, format: EUR })).toBe(1234.5);
        expect(parseNumber("-€2,000.75", { locale, format: EUR })).toBe(
            -2000.75,
        );
    });

    it("reads de-DE: the point groups, the comma is decimal", () => {
        const locale = "de-DE";
        expect(parseNumber("1.234,5", { locale })).toBe(1234.5);
        expect(parseNumber("2.000,75", { locale })).toBe(2000.75);
        expect(parseNumber("1.234", { locale })).toBe(1234);
        expect(parseNumber("1.234,50 €", { locale, format: EUR })).toBe(1234.5);
        expect(parseNumber("-2.000,75 €", { locale, format: EUR })).toBe(
            -2000.75,
        );
        // the locale's own percent text, a no-break space and all
        expect(parseNumber("25 %", { locale, format: PERCENT })).toBe(0.25);
    });

    it("reads ar-EG: Arabic-Indic digits, its own separators and the marks around the sign", () => {
        const locale = "ar-EG";
        expect(parseNumber("١٬٢٣٤٫٥", { locale })).toBe(1234.5);
        expect(parseNumber("٣٤٥٫٥", { locale })).toBe(345.5);
        expect(parseNumber(formatNumber(-1234.5, { locale }), { locale })).toBe(
            -1234.5,
        );
        expect(
            parseNumber(formatNumber(1234.5, { locale, format: EUR }), {
                locale,
                format: EUR,
            }),
        ).toBe(1234.5);
        expect(
            parseNumber(formatNumber(0.25, { locale, format: PERCENT }), {
                locale,
                format: PERCENT,
            }),
        ).toBe(0.25);
        // Latin digits and a point still read
        expect(parseNumber("12.5", { locale })).toBe(12.5);
    });

    it("round-trips what each locale writes", () => {
        for (const locale of [
            "en-US",
            "de-DE",
            "ar-EG",
            "fr-FR",
            "hi-IN",
            "fa-IR",
        ]) {
            for (const value of [0, 3, -7.5, 1234567.891, 0.001]) {
                for (const format of [undefined, EUR]) {
                    const text = formatNumber(value, { locale, format });
                    const expected =
                        format === undefined ? value : Number(value.toFixed(2));
                    expect(
                        parseNumber(text, { locale, format }),
                        `${locale} ${text}`,
                    ).toBe(expected);
                }
            }
        }
    });

    it("reads a percent as its fraction, with no floating-point noise", () => {
        expect(parseNumber("30", { locale: "en-US", format: PERCENT })).toBe(
            0.3,
        );
        expect(parseNumber("7%", { locale: "en-US", format: PERCENT })).toBe(
            0.07,
        );
        expect(parseNumber("29", { locale: "en-US", format: PERCENT })).toBe(
            0.29,
        );
    });

    it("reads an accounting negative in parentheses", () => {
        const format = { ...EUR, currencySign: "accounting" } as const;
        expect(parseNumber("(€5.00)", { locale: "en-US", format })).toBe(-5);
    });

    it("gives null for no digit, NaN for no number", () => {
        expect(parseNumber("", { locale: "en-US" })).toBeNull();
        expect(parseNumber("  ", { locale: "en-US" })).toBeNull();
        expect(parseNumber("-", { locale: "en-US" })).toBeNull();
        expect(parseNumber("1.2.3", { locale: "en-US" })).toBeNaN();
        expect(parseNumber("12a", { locale: "en-US" })).toBeNaN();
        expect(parseNumber("-0", { locale: "en-US" })).toBe(0);
    });
});

describe("isNumberText", () => {
    it("accepts what a number is written with, partial numbers included", () => {
        expect(isNumberText("", { locale: "en-US" })).toBe(true);
        expect(isNumberText("-", { locale: "en-US" })).toBe(true);
        expect(isNumberText("1.", { locale: "en-US" })).toBe(true);
        expect(isNumberText("1,2", { locale: "de-DE" })).toBe(true);
        expect(isNumberText("٣٤", { locale: "ar-EG" })).toBe(true);
        expect(isNumberText("€12", { locale: "en-US", format: EUR })).toBe(
            true,
        );
    });

    it("refuses any other character", () => {
        expect(isNumberText("12a", { locale: "en-US" })).toBe(false);
        expect(isNumberText("€12", { locale: "en-US" })).toBe(false);
        expect(isNumberText("1/2", { locale: "en-US" })).toBe(false);
    });
});

describe("formatNumber", () => {
    it("writes the locale's text, every decimal kept without a format", () => {
        expect(formatNumber(1234.5, { locale: "en-US" })).toBe("1,234.5");
        expect(formatNumber(1234.5, { locale: "de-DE" })).toBe("1.234,5");
        expect(formatNumber(1.23456789, { locale: "en-US" })).toBe(
            "1.23456789",
        );
        expect(formatNumber(1234.5, { locale: "de-DE", format: EUR })).toBe(
            "1.234,50 €",
        );
        expect(formatNumber(null, { locale: "en-US" })).toBe("");
    });
});
