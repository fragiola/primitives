import { computed, Directive, input, numberAttribute } from "@angular/core";
import {
    dataValues,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import { TagsInputRoot } from "./tags-input-root.directive.ts";

export interface TagsInputTagState {
    disabled: boolean;
    editing: boolean;
}

/**
 * One tag, focusable out of the tab order (spec/tags-input.md, "Keyboard"):
 * `<div tagsInputTag [index]="$index">`, one per value of the Root's `tags()`, in order.
 */
@Directive({
    selector: "[tagsInputTag]",
    exportAs: "tagsInputTag",
    host: {
        "[attr.tabindex]": "state().disabled ? null : '-1'",
        "data-primitives-part": "tags-input-tag",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-editing]": "data().editing",
        "(keydown)": "onKeyDown($event)",
        "(dblclick)": "root.startEdit(index())",
    },
})
export class TagsInputTag {
    /** Its position in the value. */
    readonly index = input.required({ transform: numberAttribute });

    protected readonly root = injectEnclosing(
        TagsInputRoot,
        "tagsInputRoot",
        "tagsInputTag",
    );
    readonly state = computed<TagsInputTagState>(() => ({
        disabled: this.root.isDisabled(),
        editing: this.root.editing()?.index === this.index(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    protected onKeyDown(event: KeyboardEvent): void {
        if (!this.state().disabled) {
            this.root.tagKeyDown(event, this.index());
        }
    }
}
