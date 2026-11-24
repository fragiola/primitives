import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    ColorFieldInput,
    ColorFieldRoot,
} from "@fragiola/primitives-angular/color-field";
import { colorField } from "examples-shared/recipes/color-field";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** spec/color-field.md, `/color-field/field` */
@Component({
    selector: "[scenario-color-field-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, ColorFieldRoot, ColorFieldInput, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'brand'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Brand color</label>
                <div colorFieldRoot defaultValue="#ff0000" [class]="styles.root"><input colorFieldInput [class]="styles.input" /></div>
                <p fieldDescription [class]="fieldStyles.description">A hex color.</p>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class ColorFieldField {
    protected readonly styles = colorField;
    protected readonly fieldStyles = field;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
