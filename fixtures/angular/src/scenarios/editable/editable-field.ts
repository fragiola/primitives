import { Component, signal, ViewEncapsulation } from "@angular/core";
import { editable } from "examples-shared/recipes/editable";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { area, EDITABLE_PARTS, editTrigger } from "./editable-parts.ts";

/** A required Editable in a Field (spec/editable.md, `/editable/field`). */
@Component({
    selector: "[scenario-editable-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, EDITABLE_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot class="${field.root}">
                <label fieldLabel class="${field.label}">Project name</label>
                <div editableRoot [required]="true" [name]="'project'" [placeholder]="'Name your project'" class="${editable.root}">${area()}${editTrigger("Edit project name")}</div>
                <p fieldDescription class="${field.description}">Shown on the dashboard.</p>
                <div *fieldError class="${field.error}">Enter a project name.</div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class EditableField {
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
