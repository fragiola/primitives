import {
    type NumberFormatOptions,
    numberFormatOptions,
} from "./number-format.ts";

/** The text a locale and a format write numbers with (spec/number-field.md, "Typing"). */
interface NumberSymbols {
    /** Each localized digit, mapped to its ASCII digit. */
    digits: Map<string, string>;
    group: string;
    decimal: string;
    /** The characters of the format's other text: currency, unit, percent sign, literals. */
    text: Set<string>;
    percent: boolean;
    accounting: boolean;
}

// the minus signs and plus signs a user may type, whatever the locale writes
const MINUS = "-−‐‑‒–﹣－";
const PLUS = "+＋";
// the percent signs a percent field accepts beside the locale's
const PERCENT = "%٪﹪％";
// bidirectional marks, which some locales write around a sign (ar-EG: U+061C)
const BIDI = /[‎‏؜‪-‮⁦-⁩]/g;
// the Arabic-Indic and Extended Arabic-Indic digits, read in every locale (as the ASCII ones)
const ARABIC = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";

function symbolsOf(options: NumberFormatOptions): NumberSymbols {
    const format = numberFormatOptions(options.format);
    const formatter = new Intl.NumberFormat(options.locale, {
        ...format,
        useGrouping: true,
    });
    const { numberingSystem } = formatter.resolvedOptions();
    const digitFormatter = new Intl.NumberFormat(options.locale, {
        numberingSystem,
        useGrouping: false,
    });
    const digits = new Map<string, string>();
    for (let digit = 0; digit <= 9; digit += 1) {
        digits.set(String(digit), String(digit));
        digits.set(digitFormatter.format(digit), String(digit));
        digits.set(ARABIC[digit] as string, String(digit));
        digits.set(PERSIAN[digit] as string, String(digit));
    }
    let group = "";
    let decimal = ".";
    const text = new Set<string>();
    for (const part of formatter.formatToParts(-12345.6)) {
        if (part.type === "group") {
            group = part.value;
        } else if (part.type === "decimal") {
            decimal = part.value;
        } else if (
            part.type === "currency" ||
            part.type === "unit" ||
            part.type === "percentSign" ||
            part.type === "literal"
        ) {
            for (const character of part.value) {
                text.add(character);
            }
        }
    }
    const percent = format.style === "percent";
    if (percent) {
        for (const character of PERCENT) {
            text.add(character);
        }
    }
    return {
        digits,
        group,
        decimal,
        text,
        percent,
        accounting: format.currencySign === "accounting",
    };
}

/**
 * The text reduced to ASCII digits, `.` and `-` (and whatever else was typed), or `null` when a
 * character is none a number of this locale and format can hold.
 */
function normalize(text: string, symbols: NumberSymbols): string | null {
    let negative = false;
    let result = "";
    const source = text.replace(BIDI, "").replace(/\s/g, "");
    const groupIsSpace = /^\s*$/.test(symbols.group.replace(BIDI, ""));
    for (const character of source) {
        const digit = symbols.digits.get(character);
        if (digit !== undefined) {
            result += digit;
        } else if (character === symbols.decimal) {
            result += ".";
        } else if (!groupIsSpace && character === symbols.group) {
            // a grouping separator carries no value
        } else if (character === "." || character === ",") {
            // the other separator, where the locale's group is not it: a decimal point (`1.5` in
            // ar-EG, whose own is U+066B)
            result += ".";
        } else if (MINUS.includes(character)) {
            negative = !negative;
        } else if (PLUS.includes(character)) {
            // a plus sign changes nothing
        } else if (
            symbols.accounting &&
            (character === "(" || character === ")")
        ) {
            if (character === "(") {
                negative = !negative;
            }
        } else if (symbols.text.has(character)) {
            // the currency, the unit, the percent sign: text of the format, not of the value
        } else {
            return null;
        }
    }
    return `${negative ? "-" : ""}${result}`;
}

/**
 * Whether `text` holds only what a number of this locale and format is written with (the
 * localized digits, the group and decimal separators, the signs, the format's own text), so a
 * field accepts it while it is typed (spec/number-field.md, "Typing"): `"1.2"`, `"-"` and `""`
 * pass, `"12a"` does not.
 */
export function isNumberText(
    text: string,
    options: NumberFormatOptions = {},
): boolean {
    return normalize(text, symbolsOf(options)) !== null;
}

/**
 * The number `text` writes in this locale and format (spec/number-field.md, "Typing"): the
 * localized digits (Arabic-Indic, ...), the group and decimal separators, any minus sign, the
 * currency, unit and percent text; a percent format reads `25%` as `0.25`. `null` for a text with
 * no digit (empty, or a sign alone), `NaN` for one that is no number (`1.2.3`, `12a`).
 */
export function parseNumber(
    text: string,
    options: NumberFormatOptions = {},
): number | null {
    const symbols = symbolsOf(options);
    const normalized = normalize(text, symbols);
    if (normalized === null) {
        return Number.NaN;
    }
    if (!/\d/.test(normalized)) {
        return normalized.replace("-", "") === "" ? null : Number.NaN;
    }
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(normalized)) {
        return Number.NaN;
    }
    const value = Number(normalized);
    if (!symbols.percent) {
        return value === 0 ? 0 : value;
    }
    // 25% is 0.25: divided by 100 with the decimals it had, so no floating-point noise is added
    const decimals = (normalized.split(".")[1] ?? "").length;
    const fraction = Number((value / 100).toFixed(decimals + 2));
    return fraction === 0 ? 0 : fraction;
}
