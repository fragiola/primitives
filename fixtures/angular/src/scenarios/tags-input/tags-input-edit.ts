import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/tags-input";
import { tagsInput } from "examples-shared/recipes/tags-input";
import { Output } from "../../kit/output.ts";
import {
    printList,
    TAGS_INPUT_PARTS,
    tagsInputTags,
} from "./tags-input-parts.ts";

/** Tags edited in place (spec/tags-input.md, `/tags-input/edit`). */
@Component({
    selector: "[scenario-tags-input-edit]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAGS_INPUT_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <label for="edit-tags" class="text-sm font-medium">Tags</label>
            <div tagsInputRoot #root="tagsInputRoot" editable [defaultValue]="defaultValue" (valueChangeDetails)="changed($event)" (valueInvalid)="invalid.set($event.details.cause)" [class]="styles.root">
                <div tagsInputControl [class]="styles.control">${tagsInputTags("root", true)}<input tagsInputInput id="edit-tags" [class]="styles.input" /></div>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ value: value(), reason: reason(), invalid: invalid() }"></pre>
    `,
})
export class TagsInputEdit {
    protected readonly styles = tagsInput;
    protected readonly defaultValue = ["one", "two", "three"];
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly invalid = signal<string | undefined>(undefined);

    protected changed(event: ValueChangeEvent<readonly string[]>): void {
        this.value.set(printList(event.value));
        this.reason.set(event.details.reason);
    }
}
