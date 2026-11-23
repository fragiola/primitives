import { computed, Directive } from "@angular/core";
import {
    dataValues,
    injectEnclosing,
} from "@fragiola/primitives-angular/internal";
import { TagsInputRoot } from "./tags-input-root.directive.ts";

export interface TagsInputClearTriggerState {
    disabled: boolean;
}

/**
 * Removes every tag and the text, and focuses the Input (spec/tags-input.md):
 * `<button tagsInputClearTrigger aria-label="Clear tags">`; hidden while there is nothing to clear.
 */
@Directive({
    selector: "[tagsInputClearTrigger]",
    exportAs: "tagsInputClearTrigger",
    host: {
        type: "button",
        "[attr.disabled]": "data().disabled",
        "[attr.hidden]": "root.empty() && root.text() === '' ? '' : null",
        "data-primitives-part": "tags-input-clear-trigger",
        "[attr.data-disabled]": "data().disabled",
        "(mousedown)": "$event.preventDefault()",
        "(click)": "root.clear($event)",
    },
})
export class TagsInputClearTrigger {
    protected readonly root = injectEnclosing(
        TagsInputRoot,
        "tagsInputRoot",
        "tagsInputClearTrigger",
    );
    readonly state = computed<TagsInputClearTriggerState>(() => ({
        disabled: this.root.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
}
