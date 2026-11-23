export interface RatingKeyOptions {
    /** The number of stars: the highest value. */
    count: number;
    /** Half steps (0.5) instead of whole ones. */
    allowHalf: boolean;
    rtl: boolean;
    /** Wrap from `count` to the first step, and back (spec/rating.md, `loopFocus`). */
    loop: boolean;
}

/**
 * The value a key moves a rating to (spec/rating.md, "Keyboard"): ArrowRight and ArrowDown one
 * step up, ArrowLeft and ArrowUp one step down (Left and Right swapped in RTL), from `0` to the
 * first step, wrapping between the first step and `count` with `loop`, never to `0`; Home the
 * first step, End `count`. The step is 1, or 0.5 with `allowHalf`. `null` when the key does not
 * change it: another key, an end without `loop`, or the value it already has.
 */
export function ratingKeyTarget(
    key: string,
    value: number,
    options: RatingKeyOptions,
): number | null {
    const step = options.allowHalf ? 0.5 : 1;
    const first = Math.min(step, options.count);
    const up = options.rtl
        ? key === "ArrowDown" || key === "ArrowLeft"
        : key === "ArrowDown" || key === "ArrowRight";
    const down = options.rtl
        ? key === "ArrowUp" || key === "ArrowRight"
        : key === "ArrowUp" || key === "ArrowLeft";
    let target: number | null = null;
    if (key === "Home") {
        target = first;
    } else if (key === "End") {
        target = options.count;
    } else if (up) {
        const next = (Math.floor(value / step) + 1) * step;
        target = next <= options.count ? next : options.loop ? first : null;
    } else if (down) {
        const previous = (Math.ceil(value / step) - 1) * step;
        target =
            previous >= first ? previous : options.loop ? options.count : null;
    }
    return target === null || target === value || options.count < 1
        ? null
        : target;
}

/**
 * The value a pointer at `fraction` of star `index` chooses (spec/rating.md, "Pointer"): the
 * fraction is along the star from its inline-start edge (the toolkit's `fractionAlong`, so the
 * right edge in RTL). With `allowHalf`, its inline-start half chooses `index - 0.5`.
 */
export function ratingValueAt(
    index: number,
    fraction: number,
    allowHalf: boolean,
): number {
    return allowHalf && fraction < 0.5 ? index - 0.5 : index;
}

/** A star's drawn state (spec/rating.md, "API"). */
export interface RatingItemState {
    /** The star holds `value`: `index` is `value` rounded up. */
    checked: boolean;
    /** The star is drawn filled, whole or half, for the displayed value. */
    highlighted: boolean;
    /** The star is drawn half filled: the displayed value is `index - 0.5`. */
    half: boolean;
}

/**
 * Star `index`'s state (spec/rating.md, "API"): `checked` by the value, `highlighted` and `half` by
 * the displayed one (the pointer's preview while it runs, else the value).
 */
export function ratingItemState(
    index: number,
    value: number,
    displayed: number = value,
): RatingItemState {
    return {
        checked: value > 0 && Math.ceil(value) === index,
        highlighted: displayed > 0 && index <= Math.ceil(displayed),
        half: displayed > 0 && displayed === index - 0.5,
    };
}
