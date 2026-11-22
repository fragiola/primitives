import { valueToPercent } from "./range-math.ts";

/** A Progress's status (spec/progress.md): exactly one of these. */
export type ProgressStatus = "indeterminate" | "progressing" | "complete";

export interface ProgressOptions {
    /** The lowest value (default `0`). */
    min?: number;
    /** The highest value (default `100`). */
    max?: number;
    /**
     * How the value is written. Without it, the value is written as a percentage of the range
     * (`{ style: "percent" }` of its fraction).
     */
    format?: Intl.NumberFormatOptions;
    /** The locale of the format (BCP 47; default: the runtime's). */
    locale?: string;
}

export interface ProgressValue {
    /** The value clamped to `[min, max]`, or `null` when indeterminate. */
    value: number | null;
    /** Where the value sits in the range, from 0 to 100; `null` when indeterminate. */
    percent: number | null;
    status: ProgressStatus;
    /** The value as `format` writes it (a percentage by default); `""` when indeterminate. */
    formattedValue: string;
}

/**
 * A Progress's value, percent, status and formatted value (spec/progress.md, "API"): the value is
 * clamped to `[min, max]`, `null` is indeterminate, the clamped `max` is complete.
 */
export function progressValue(
    value: number | null,
    options: ProgressOptions = {},
): ProgressValue {
    const { min = 0, max = 100, format, locale } = options;
    if (value === null || Number.isNaN(value)) {
        return {
            value: null,
            percent: null,
            status: "indeterminate",
            formattedValue: "",
        };
    }
    const clamped = Math.min(Math.max(value, min), max);
    const percent = valueToPercent(clamped, min, max);
    const formattedValue =
        format === undefined
            ? new Intl.NumberFormat(locale, { style: "percent" }).format(
                  percent / 100,
              )
            : new Intl.NumberFormat(locale, format).format(clamped);
    return {
        value: clamped,
        percent,
        status: clamped === max ? "complete" : "progressing",
        formattedValue,
    };
}
