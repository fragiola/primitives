import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { rating } from "examples-shared/recipes/rating";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { RATING_PARTS, ratingStars, starName } from "./rating-stars.ts";

/** A required rating in a Field (spec/rating.md, `/rating/field`). */
@Component({
    selector: "[scenario-rating-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, RATING_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Satisfaction</label>
                <div ratingRoot #root="ratingRoot" [required]="true" [name]="'satisfaction'" [class]="styles.root">${ratingStars("root", "root.value()")}<input ratingHiddenInput /></div>
                <p fieldDescription [class]="fieldStyles.description">How was your stay?</p>
                <div *fieldError [class]="fieldStyles.error">Choose a rating.</div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class RatingField {
    protected readonly styles = rating;
    protected readonly fieldStyles = field;
    protected readonly starName = starName;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
