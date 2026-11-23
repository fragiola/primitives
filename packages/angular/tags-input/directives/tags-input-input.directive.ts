import { computed, Directive } from "@angular/core";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    injectEnclosing,
    injectId,
    ownAttribute,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { TagsInputRoot } from "./tags-input-root.directive.ts";

export interface TagsInputInputState {
    disabled: boolean;
    empty: boolean;
}

/**
 * The text the next tag is typed in: the labelled control (spec/tags-input.md),
 * `<input tagsInputInput id="tags">`, named by a `<label for>` or a `Field.Label`. Its id is the
 * consumer's, else its own.
 */
@Directive({
    selector: "input[tagsInputInput]",
    exportAs: "tagsInputInput",
    host: {
        "[attr.id]": "id",
        "[value]": "root.text()",
        // the attribute follows the value, as React's controlled input: a server render writes
        // it, so the page rendered in the browser alone has it too
        "[attr.value]": "root.text()",
        "[attr.disabled]": "state().disabled ? '' : null",
        "[attr.aria-required]": "root.required() ? 'true' : null",
        "data-primitives-part": "tags-input-input",
        "(input)": "root.inputChanged($event)",
        "(keydown)": "root.inputKeyDown($event)",
        "(paste)": "root.inputPasted($event)",
    },
})
export class TagsInputInput {
    protected readonly root = injectEnclosing(
        TagsInputRoot,
        "tagsInputRoot",
        "tagsInputInput",
    );
    protected readonly id =
        ownAttribute("id") ?? injectId("primitives-tags-input-input");
    private readonly element = registerHost<HTMLInputElement>(this.root.input);
    readonly state = computed<TagsInputInputState>(() => ({
        disabled: this.root.isDisabled(),
        empty: this.root.empty(),
    }));

    constructor() {
        const { field } = this.root;
        writeFieldAria(field, this.element, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
        this.root.inputId.set(this.id);
    }
}
