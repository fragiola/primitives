import { computed, Directive } from "@angular/core";
import {
    dataValues,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import { TagsInputRoot } from "./tags-input-root.directive.ts";

export interface TagsInputControlState {
    disabled: boolean;
    empty: boolean;
}

/**
 * Holds the Tags and the Input (spec/tags-input.md): `<div tagsInputControl>`. A press on it,
 * outside them, focuses the Input.
 */
@Directive({
    selector: "[tagsInputControl]",
    exportAs: "tagsInputControl",
    host: {
        "data-primitives-part": "tags-input-control",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-empty]": "data().empty",
        "(mousedown)": "onMouseDown($event)",
    },
})
export class TagsInputControl {
    private readonly root = injectEnclosing(
        TagsInputRoot,
        "tagsInputRoot",
        "tagsInputControl",
    );
    readonly state = computed<TagsInputControlState>(() => ({
        disabled: this.root.isDisabled(),
        empty: this.root.empty(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    protected onMouseDown(event: MouseEvent): void {
        if (event.target === event.currentTarget && !this.state().disabled) {
            event.preventDefault();
            this.root.focusInput();
        }
    }
}
