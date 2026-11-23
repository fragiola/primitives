import { computed, Directive } from "@angular/core";
import {
    dataValues,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import { TagsInputRoot } from "./tags-input-root.directive.ts";
import { TagsInputTag } from "./tags-input-tag.directive.ts";

export interface TagsInputTagRemoveState {
    disabled: boolean;
}

/**
 * Removes its Tag and focuses the Input (spec/tags-input.md, "Pointer"):
 * `<button tagsInputTagRemove aria-label="Remove react">`; hidden while its Tag is edited.
 */
@Directive({
    selector: "[tagsInputTagRemove]",
    exportAs: "tagsInputTagRemove",
    host: {
        type: "button",
        tabindex: "-1",
        "[attr.disabled]": "data().disabled",
        "[attr.hidden]": "tag.state().editing ? '' : null",
        "data-primitives-part": "tags-input-tag-remove",
        "[attr.data-disabled]": "data().disabled",
        "(mousedown)": "$event.preventDefault()",
        "(click)": "onClick($event)",
    },
})
export class TagsInputTagRemove {
    private readonly root = injectEnclosing(
        TagsInputRoot,
        "tagsInputRoot",
        "tagsInputTagRemove",
    );
    protected readonly tag = injectEnclosing(
        TagsInputTag,
        "tagsInputTag",
        "tagsInputTagRemove",
    );
    readonly state = computed<TagsInputTagRemoveState>(() => ({
        disabled: this.tag.state().disabled,
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    protected onClick(event: MouseEvent): void {
        this.root.removeAt(this.tag.index(), "chip-remove-press", event);
        this.root.focusInput();
    }
}
