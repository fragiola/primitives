import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/tags-input";
import { tagsInput } from "examples-shared/recipes/tags-input";
import { Output } from "../../kit/output.ts";
import {
    printList,
    TAGS_INPUT_PARTS,
    tagsInputTags,
} from "./tags-input-parts.ts";

/** An uncontrolled TagsInput (spec/tags-input.md, `/tags-input/basic`). */
@Component({
    selector: "[scenario-tags-input-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAGS_INPUT_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <label for="tags" class="text-sm font-medium">Tags</label>
            <div tagsInputRoot #root="tagsInputRoot" [defaultValue]="defaultValue" (valueChangeDetails)="changed($event)" (valueInvalid)="invalid.set($event.details.cause)" [class]="styles.root">
                <div tagsInputControl [class]="styles.control">${tagsInputTags("root")}<input tagsInputInput id="tags" [class]="styles.input" /></div>
                <button tagsInputClearTrigger aria-label="Clear tags" [class]="styles['clear-trigger']">×</button>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ value: value(), reason: reason(), invalid: invalid() }"></pre>
    `,
})
export class TagsInputBasic {
    protected readonly styles = tagsInput;
    protected readonly defaultValue = ["react", "vue"];
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly invalid = signal<string | undefined>(undefined);

    protected changed(event: ValueChangeEvent<readonly string[]>): void {
        this.value.set(printList(event.value));
        this.reason.set(event.details.reason);
    }
}
