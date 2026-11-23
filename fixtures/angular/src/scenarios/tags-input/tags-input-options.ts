import { Component, signal, ViewEncapsulation } from "@angular/core";
import type {
    TagsInputInvalidEvent,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/tags-input";
import { tagsInput } from "examples-shared/recipes/tags-input";
import { Output } from "../../kit/output.ts";
import {
    printList,
    TAGS_INPUT_PARTS,
    tagsInputTags,
} from "./tags-input-parts.ts";

/** `delimiter`, `max` and `validate` (spec/tags-input.md, `/tags-input/options`). */
@Component({
    selector: "[scenario-tags-input-options]",
    encapsulation: ViewEncapsulation.None,
    imports: [TAGS_INPUT_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-4">
            <label for="emails" class="text-sm font-medium">Emails</label>
            <div tagsInputRoot #root="tagsInputRoot" delimiter=";" [max]="3" [validate]="validate" (valueChangeDetails)="changed($event)" (valueInvalid)="refused($event)" [class]="styles.root">
                <div tagsInputControl [class]="styles.control">${tagsInputTags("root")}<input tagsInputInput id="emails" [class]="styles.input" /></div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ value: value(), reason: reason(), invalid: invalid() }"></pre>
    `,
})
export class TagsInputOptions {
    protected readonly styles = tagsInput;
    protected readonly validate = (tag: string) => tag.includes("@");
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly invalid = signal<string | undefined>(undefined);

    protected changed(event: ValueChangeEvent<readonly string[]>): void {
        this.value.set(printList(event.value));
        this.reason.set(event.details.reason);
    }

    protected refused(event: TagsInputInvalidEvent): void {
        this.invalid.set(`${event.details.cause} ${event.value}`);
    }
}
