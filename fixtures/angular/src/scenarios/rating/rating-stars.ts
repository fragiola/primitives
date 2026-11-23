import {
    RatingHiddenInput,
    RatingItem,
    RatingRoot,
} from "@fragiola/primitives-angular/rating";

/** Every Rating directive, for a scenario's `imports`. */
export const RATING_PARTS = [
    RatingRoot,
    RatingItem,
    RatingHiddenInput,
] as const;

/**
 * A star's name (spec/rating.md, "Scenarios"): "1 star", "2 stars", ...; the checked star of a
 * half value is named by the value ("2.5 stars").
 */
export function starName(index: number, value: number): string {
    if (value > 0 && Math.ceil(value) === index && value !== index) {
        return `${value} stars`;
    }
    return index === 1 ? "1 star" : `${index} stars`;
}

const STAR =
    "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.5l7.1-.6z";

/** The star mark: an outline, and its fill over it (the recipe shows it by the Item's state). */
const MARK = `<svg [attr.class]="styles.star" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}" /></svg><span [class]="styles.fill" aria-hidden="true"><svg [attr.class]="styles.star" viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}" /></svg></span>`;

/**
 * The stars of a Root, from its `items()` (`root` names its template reference), each named by
 * `starName` of `value` (an expression of the component), as React's `RatingStars`.
 */
export function ratingStars(root: string, value: string): string {
    return `@for (index of ${root}.items(); track index) {<button ratingItem [index]="index" [attr.aria-label]="starName(index, ${value})" [class]="styles.item">${MARK}</button>}`;
}
