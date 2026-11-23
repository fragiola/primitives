import { Component, signal, ViewEncapsulation } from "@angular/core";
import { rating } from "examples-shared/recipes/rating";
import { Output } from "../../kit/output.ts";
import { RATING_PARTS, ratingStars, starName } from "./rating-stars.ts";

/** A read-only and a disabled rating (spec/rating.md, `/rating/read-only`). */
@Component({
    selector: "[scenario-rating-read-only]",
    encapsulation: ViewEncapsulation.None,
    imports: [RATING_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-2">
            <h2 id="quality" class="text-sm font-semibold">Quality</h2>
            <div ratingRoot #quality="ratingRoot" aria-labelledby="quality" [readOnly]="true" [defaultValue]="3" (valueChange)="value.set($event)" [class]="styles.root">${ratingStars("quality", "quality.value()")}</div>
            <h2 id="service" class="text-sm font-semibold">Service</h2>
            <div ratingRoot #service="ratingRoot" aria-labelledby="service" [disabled]="true" [defaultValue]="2" (valueChange)="value.set($event)" [class]="styles.root">${ratingStars("service", "service.value()")}</div>
        </div>
        <button type="button" class="mt-2">After</button>
        <pre fixtureOutput [values]="{ value: value() }"></pre>
    `,
})
export class RatingReadOnly {
    protected readonly styles = rating;
    protected readonly starName = starName;
    protected readonly value = signal<number | undefined>(undefined);
}
