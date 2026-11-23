/** How a number field writes and reads its value (spec/number-field.md, "API"). */
export interface NumberFormatOptions {
    /** The locale (BCP 47; default: the runtime's). */
    locale?: string | undefined;
    /** `Intl.NumberFormat` options; without them, the plain number with every decimal it has. */
    format?: Intl.NumberFormatOptions | undefined;
}

/** The `Intl.NumberFormat` options a field formats with: `format`, else every decimal kept. */
export function numberFormatOptions(
    format: Intl.NumberFormatOptions | undefined,
): Intl.NumberFormatOptions {
    return format ?? { maximumFractionDigits: 20 };
}

/**
 * `value` as the field writes it (spec/number-field.md): `Intl.NumberFormat` of the locale and
 * the format; `""` for `null` (an empty field).
 */
export function formatNumber(
    value: number | null,
    options: NumberFormatOptions = {},
): string {
    if (value === null || Number.isNaN(value)) {
        return "";
    }
    return new Intl.NumberFormat(
        options.locale,
        numberFormatOptions(options.format),
    ).format(value);
}
