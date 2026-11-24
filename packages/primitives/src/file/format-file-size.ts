const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"] as const;

/**
 * A file size in the locale's bytes (spec/file-upload.md, "State attributes and ARIA"):
 * `Intl.NumberFormat`'s `unit` style, short, in decimal units (`Intl`'s are SI: 1 kB = 1000
 * bytes), with one fraction digit above bytes: `en-US` writes `512 byte`, `1.5 kB`, `2 MB`.
 * Locale data, not text of the library's own; `undefined` is the runtime's locale.
 */
export function formatFileSize(
    bytes: number,
    locale?: string | readonly string[],
): string {
    let value = Math.max(0, bytes);
    let unit = 0;
    // the unit is chosen after rounding to one fraction digit: 999 950 bytes is `1 MB`
    while (Math.round(value * 10) / 10 >= 1000 && unit < UNITS.length - 1) {
        value /= 1000;
        unit += 1;
    }
    return new Intl.NumberFormat(locale as string | string[] | undefined, {
        style: "unit",
        unit: UNITS[unit],
        unitDisplay: "short",
        maximumFractionDigits: unit === 0 ? 0 : 1,
    }).format(value);
}
