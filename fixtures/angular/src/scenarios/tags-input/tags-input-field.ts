import { Component, signal, ViewEncapsulation } from "@angular/core";
import { field } from "examples-shared/recipes/field";
import { tagsInput } from "examples-shared/recipes/tags-input";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { TAGS_INPUT_PARTS, tagsInputTags } from "./tags-input-parts.ts";

/** A required TagsInput in a Field, and another in the same form (spec/tags-input.md). */
@Component({
    selector: "[scenario-tags-input-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, TAGS_INPUT_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div fieldRoot [name]="'tags'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Tags</label>
                <div tagsInputRoot #tags="tagsInputRoot" [required]="true" [class]="styles.root">
                    <div tagsInputControl [class]="styles.control">${tagsInputTags("tags")}<input tagsInputInput [class]="styles.input" /></div>
                </div>
                <p fieldDescription [class]="fieldStyles.description">Press Enter to add a tag.</p>
                <div *fieldError [class]="fieldStyles.error">Add at least one tag.</div>
            </div>
            <div class="flex flex-col items-start gap-1">
                <label for="labels" class="text-sm font-medium">Labels</label>
                <div tagsInputRoot #labels="tagsInputRoot" [name]="'labels'" [defaultValue]="defaultLabels" [class]="styles.root">
                    <div tagsInputControl [class]="styles.control">${tagsInputTags("labels")}<input tagsInputInput id="labels" [class]="styles.input" /></div>
                </div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class TagsInputField {
    protected readonly styles = tagsInput;
    protected readonly fieldStyles = field;
    protected readonly defaultLabels = ["bug"];
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
