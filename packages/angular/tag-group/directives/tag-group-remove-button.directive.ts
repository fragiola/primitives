import { computed, Directive } from "@angular/core";
import {
    dataValues,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import { TagGroupRoot } from "./tag-group-root.directive.ts";
import { TagGroupTag } from "./tag-group-tag.directive.ts";

export interface TagGroupRemoveButtonState {
    disabled: boolean;
}

/**
 * Removes its Tag (spec/tag-group.md, "Pointer"): `<button tagGroupRemoveButton aria-label="Remove
 * News">`, inside the Tag's TagCell. A press never takes the focus, and selects nothing.
 */
@Directive({
    selector: "[tagGroupRemoveButton]",
    exportAs: "tagGroupRemoveButton",
    host: {
        type: "button",
        tabindex: "-1",
        "data-primitives-part": "tag-group-remove-button",
        "[attr.disabled]": "data().disabled",
        "[attr.data-disabled]": "data().disabled",
        "(mousedown)": "$event.preventDefault()",
        "(click)": "onClick($event)",
    },
})
export class TagGroupRemoveButton {
    private readonly root = injectEnclosing(
        TagGroupRoot,
        "tagGroupRoot",
        "tagGroupRemoveButton",
    );
    private readonly tag = injectEnclosing(
        TagGroupTag,
        "tagGroupTag",
        "tagGroupRemoveButton",
    );
    readonly state = computed<TagGroupRemoveButtonState>(() => ({
        disabled: this.tag.state().disabled,
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    protected onClick(event: MouseEvent): void {
        // the Tag's own click selects nothing for it
        event.preventDefault();
        this.root.removeTag(this.tag.element, "chip-remove-press", event);
    }
}
