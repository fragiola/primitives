import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { ValueChangeEvent } from "@fragiola/primitives-angular/tags-input";
import { tagsInput } from "examples-shared/recipes/tags-input";
import { Output } from "../../kit/output.ts";
import {
    printList,
    TAGS_INPUT_PARTS,
    tagsInputTags,
} from "./tags-input-parts.ts";

/** The three `blurBehavior`s (spec/tags-input.md, `/tags-input/blur`). */
@Component({
    selector: "[scenario-tags-input-blur]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAGS_INPUT_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <label for="add-on-blur" class="text-sm font-medium">Add on blur</label>
            <div tagsInputRoot #adding="tagsInputRoot" blurBehavior="add" (valueChangeDetails)="added($event)" [class]="styles.root">
                <div tagsInputControl [class]="styles.control">${tagsInputTags("adding")}<input tagsInputInput id="add-on-blur" [class]="styles.input" /></div>
            </div>
            <label for="clear-on-blur" class="text-sm font-medium">Clear on blur</label>
            <div tagsInputRoot #clearing="tagsInputRoot" blurBehavior="clear" (valueChange)="cleared.set(print($event))" [class]="styles.root">
                <div tagsInputControl [class]="styles.control">${tagsInputTags("clearing")}<input tagsInputInput id="clear-on-blur" [class]="styles.input" /></div>
            </div>
            <label for="keep-on-blur" class="text-sm font-medium">Keep on blur</label>
            <div tagsInputRoot #keeping="tagsInputRoot" [class]="styles.root">
                <div tagsInputControl [class]="styles.control">${tagsInputTags("keeping")}<input tagsInputInput id="keep-on-blur" [class]="styles.input" /></div>
            </div>
            <button type="button">After</button>
        </div>
        <pre fixtureOutput [values]="{ add: add(), 'add-reason': addReason(), clear: cleared() }"></pre>
    `,
})
export class TagsInputBlur {
    protected readonly styles = tagsInput;
    protected readonly print = printList;
    protected readonly add = signal<string | undefined>(undefined);
    protected readonly addReason = signal<string | undefined>(undefined);
    protected readonly cleared = signal<string | undefined>(undefined);

    protected added(event: ValueChangeEvent<readonly string[]>): void {
        this.add.set(printList(event.value));
        this.addReason.set(event.details.reason);
    }
}
