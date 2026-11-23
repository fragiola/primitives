import { NgTemplateOutlet } from "@angular/common";
import { Component, computed, signal } from "@angular/core";
import { RatingItem, RatingRoot } from "@fragiola/primitives-angular/rating";
import { styles } from "./styles.ts";

const AVERAGE = 4.5;

const STAR =
    "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.5l7.1-.6z";

/** A star's name: "1 star", "2 stars", ...; the star that holds a half value is named by it. */
function starName(index: number, value: number): string {
    if (Math.ceil(value) === index && value !== index) return `${value} stars`;
    return index === 1 ? "1 star" : `${index} stars`;
}

// A product rating (spec/rating.md): the reviews' average, read-only and in half steps (focusable,
// nothing changes it), and the reader's own score. The pointer previews a score, a press or an
// arrow chooses it, Home and End reach the ends, and pressing the chosen star again clears it.
// Each star holds the mark: an outlined star, and a filled one over it that the recipe shows by
// the state.
@Component({
    selector: "example-product-rating",
    imports: [RatingRoot, RatingItem, NgTemplateOutlet],
    template: `
        <ng-template #star>
            <svg [attr.class]="styles.star" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="path" /></svg>
            <span [class]="styles.fill" aria-hidden="true"><svg [attr.class]="styles.star" viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="path" /></svg></span>
        </ng-template>
        <div [class]="styles.stack">
            <div [class]="styles.row">
                <span id="average-label" [class]="styles.label">Average rating</span>
                <div ratingRoot #average="ratingRoot" aria-labelledby="average-label" readOnly allowHalf [defaultValue]="averageValue" [class]="styles.root">
                    @for (index of average.items(); track index) {
                        <button ratingItem [index]="index" [attr.aria-label]="starName(index, averageValue)" [class]="styles.item"><ng-container *ngTemplateOutlet="star" /></button>
                    }
                </div>
                <span [class]="styles.note">From 128 reviews.</span>
            </div>
            <div [class]="styles.row">
                <span id="score-label" [class]="styles.label">Your rating</span>
                <div ratingRoot #own="ratingRoot" aria-labelledby="score-label" allowClear [(value)]="score" [class]="styles.root">
                    @for (index of own.items(); track index) {
                        <button ratingItem [index]="index" [attr.aria-label]="starName(index, score())" [class]="styles.item"><ng-container *ngTemplateOutlet="star" /></button>
                    }
                </div>
                <p role="status" [class]="styles.note">{{ status() }}</p>
            </div>
        </div>
    `,
})
export default class ProductRating {
    protected readonly styles = styles;
    protected readonly path = STAR;
    protected readonly starName = starName;
    protected readonly averageValue = AVERAGE;
    protected readonly score = signal(0);
    protected readonly status = computed(() => {
        const score = this.score();
        return score === 0
            ? "Not rated yet."
            : `You rated it ${starName(score, score)}.`;
    });
}
