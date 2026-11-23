import { Component, signal, ViewEncapsulation } from "@angular/core";
import { editable } from "examples-shared/recipes/editable";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import {
    area,
    cancelTrigger,
    EDITABLE_PARTS,
    editTrigger,
    printEnd,
    printText,
    submitTrigger,
} from "./editable-parts.ts";

/** An inline-editable title in a form (spec/editable.md, `/editable/basic`). */
@Component({
    selector: "[scenario-editable-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, EDITABLE_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot class="${field.root}">
                <label fieldLabel class="${field.label}">Title</label>
                <div editableRoot [name]="'title'" [defaultValue]="'Quarterly report'" [placeholder]="'Untitled'" (valueChange)="value.set(printText($event))" (valueCommit)="commit.set(printEnd($event))" (valueRevert)="revert.set(printEnd($event))" class="${editable.root}">${area()}${editTrigger("Edit title")}${submitTrigger("Save title")}${cancelTrigger("Cancel edit")}</div>
            </div>
            <button type="button">After</button>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ value: value(), commit: commit(), revert: revert(), form: form() }"></pre>
    `,
})
export class EditableBasic {
    protected readonly printText = printText;
    protected readonly printEnd = printEnd;
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly commit = signal<string | undefined>(undefined);
    protected readonly revert = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
