/** The bounds and grid a number field steps within (spec/number-field.md, "API"). */
export interface NumberStepOptions {
    /** The lowest value; none when not given. */
    min?: number | undefined;
    /** The highest value; none when not given. */
    max?: number | undefined;
    /** Step to the grid of `|amount|` (counted from `min`, else from 0) instead of by `amount`. */
    snapOnStep?: boolean | undefined;
}

function decimalsOf(value: number): number {
    if (!Number.isFinite(value)) {
        return 0;
    }
    const text = String(value);
    const exponent = /e-(\d+)$/.exec(text);
    if (exponent !== null) {
        return (
            Number(exponent[1]) +
            (text.split(".")[1]?.split("e")[0] ?? "").length
        );
    }
    return (text.split(".")[1] ?? "").length;
}

/** `value` rounded to `decimals`, without floating-point noise (0.1 + 0.2). */
function roundTo(value: number, decimals: number): number {
    const rounded = Number(value.toFixed(Math.min(decimals, 20)));
    return rounded === 0 ? 0 : rounded;
}

/** `value` within `[min, max]` (either bound may be missing). */
export function clampNumber(
    value: number,
    min: number | undefined,
    max: number | undefined,
): number {
    let result = value;
    if (max !== undefined && result > max) {
        result = max;
    }
    if (min !== undefined && result < min) {
        result = min;
    }
    return result;
}

/**
 * The value one step of `amount` away (negative: down), clamped to `[min, max]`
 * (spec/number-field.md, "Stepping"). An empty field (`null`) starts at 0, clamped, with no step
 * (Base UI). With `snapOnStep`, a value off the grid of `|amount|` goes to the next grid point in
 * the step's direction (`1.5` up by 1 gives `2`, down gives `1`).
 */
export function stepNumber(
    value: number | null,
    amount: number,
    options: NumberStepOptions = {},
): number {
    const { min, max, snapOnStep = false } = options;
    if (value === null || Number.isNaN(value)) {
        return clampNumber(0, min, max);
    }
    const decimals = Math.max(
        decimalsOf(value),
        decimalsOf(amount),
        decimalsOf(min ?? 0),
    );
    if (!snapOnStep || amount === 0) {
        return clampNumber(roundTo(value + amount, decimals), min, max);
    }
    const grid = Math.abs(amount);
    const base = min ?? 0;
    // the grid index, without the noise of a division (2.9999999 is 3)
    const index = roundTo((value - base) / grid, 10);
    const target = amount > 0 ? Math.floor(index) + 1 : Math.ceil(index) - 1;
    const gridDecimals = Math.max(decimalsOf(grid), decimalsOf(base));
    return clampNumber(roundTo(base + target * grid, gridDecimals), min, max);
}
