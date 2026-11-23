import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { segmentedControl } from "examples-shared/recipes/segmented-control";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { SEGMENTED_CONTROL_PARTS, segments } from "./segments.ts";
import { DENSITIES } from "./views.ts";

/** A required control in a Field (spec/segmented-control.md, `/segmented-control/field`). */
@Component({
    selector: "[scenario-segmented-control-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, SEGMENTED_CONTROL_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Density</label>
                <div segmentedControlRoot [required]="true" [name]="'density'" [class]="styles.root">${segments("segments")}</div>
                <p fieldDescription [class]="fieldStyles.description">Spacing of the rows.</p>
                <div *fieldError [class]="fieldStyles.error">Choose a density.</div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class SegmentedControlField {
    protected readonly styles = segmentedControl;
    protected readonly fieldStyles = field;
    protected readonly segments = DENSITIES;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
