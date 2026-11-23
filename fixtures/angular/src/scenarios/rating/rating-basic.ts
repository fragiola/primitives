import { Component, signal, ViewEncapsulation } from "@angular/core";
import { rating } from "examples-shared/recipes/rating";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { RATING_PARTS, ratingStars, starName } from "./rating-stars.ts";

/** A rating in a form (spec/rating.md, `/rating/basic`). */
@Component({
    selector: "[scenario-rating-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [RATING_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <h2 id="rating" class="text-sm font-semibold">Rating</h2>
            <div ratingRoot #root="ratingRoot" aria-labelledby="rating" [name]="'rating'" (valueChangeDetails)="value.set($event.value); reason.set($event.details.reason)" [class]="styles.root">${ratingStars("root", "root.value()")}<input ratingHiddenInput /></div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), reason: reason(), form: form() }"></pre>
    `,
})
export class RatingBasic {
    protected readonly styles = rating;
    protected readonly starName = starName;
    protected readonly value = signal<number | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
