import { afterRenderEffect, computed, Directive } from "@angular/core";
import {
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { composing } from "../utils/composing.ts";
import { TagsInputRoot } from "./tags-input-root.directive.ts";
import { TagsInputTag } from "./tags-input-tag.directive.ts";

export interface TagsInputTagInputState {
    editing: boolean;
}

/**
 * Edits its Tag in place (spec/tags-input.md, "Editing a tag"): `<input tagsInputTagInput
 * aria-label="Edit tag">` inside the Tag, `hidden` until the tag is edited, then focused with its
 * text selected.
 */
@Directive({
    selector: "input[tagsInputTagInput]",
    exportAs: "tagsInputTagInput",
    host: {
        tabindex: "-1",
        "[attr.hidden]": "state().editing ? null : ''",
        "[attr.disabled]": "root.isDisabled() ? '' : null",
        "[value]": "text()",
        // the attribute follows the value, as the Input's (a server render writes it)
        "[attr.value]": "text()",
        "data-primitives-part": "tags-input-tag-input",
        "(input)": "onInput()",
        "(keydown)": "onKeyDown($event)",
        "(blur)": "root.tagInputBlurred(tag.index(), $event)",
    },
})
export class TagsInputTagInput {
    protected readonly root = injectEnclosing(
        TagsInputRoot,
        "tagsInputRoot",
        "tagsInputTagInput",
    );
    protected readonly tag = injectEnclosing(
        TagsInputTag,
        "tagsInputTag",
        "tagsInputTagInput",
    );
    private readonly element = injectHost<HTMLInputElement>();
    // a boolean, so the text typed in the edit runs nothing that tracks it
    private readonly editing = computed(() => this.tag.state().editing);
    readonly state = computed<TagsInputTagInputState>(() => ({
        editing: this.editing(),
    }));
    protected readonly text = computed(() =>
        this.state().editing ? (this.root.editing()?.text ?? "") : "",
    );

    constructor() {
        // the edit starts: it takes the focus once shown
        afterRenderEffect(() => {
            if (this.editing()) {
                this.element.focus();
                this.element.select();
            }
        });
    }

    protected onInput(): void {
        this.root.setEditText(this.element.value);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (!this.state().editing || composing(event)) {
            return;
        }
        if (event.key === "Enter") {
            event.preventDefault();
            this.root.commitEdit("keyboard", event, true);
        } else if (event.key === "Escape") {
            event.preventDefault();
            this.root.cancelEdit();
        }
    }
}
