import { Component, signal, ViewEncapsulation } from "@angular/core";
import { rating } from "examples-shared/recipes/rating";
import { Output } from "../../kit/output.ts";
import { RATING_PARTS, ratingStars, starName } from "./rating-stars.ts";

/** A controlled rating in half steps that clears (spec/rating.md, `/rating/half`). */
@Component({
    selector: "[scenario-rating-half]",
    encapsulation: ViewEncapsulation.None,
    imports: [RATING_PARTS, Output],
    template: `
        <h2 id="half-rating" class="text-sm font-semibold">Half rating</h2>
        <div ratingRoot #root="ratingRoot" aria-labelledby="half-rating" [allowHalf]="true" [allowClear]="true" [value]="value()" (valueChangeDetails)="value.set($event.value); reason.set($event.details.reason)" [class]="styles.root">${ratingStars("root", "value()")}</div>
        <pre fixtureOutput [values]="{ value: value(), reason: reason() }"></pre>
    `,
})
export class RatingHalf {
    protected readonly styles = rating;
    protected readonly starName = starName;
    protected readonly value = signal(2.5);
    protected readonly reason = signal<string | undefined>(undefined);
}
