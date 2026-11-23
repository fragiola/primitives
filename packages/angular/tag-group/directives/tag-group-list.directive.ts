import { computed, Directive } from "@angular/core";
import {
    dataValues,
    injectEnclosing,
    ownAttribute,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { TagGroupRoot } from "./tag-group-root.directive.ts";

export interface TagGroupListState {
    empty: boolean;
    disabled: boolean;
}

/**
 * The `grid` of tags, a `group` while it holds none (spec/tag-group.md): `<div tagGroupList>`
 * around the `[tagGroupTag]`s. It takes the focus after the last removal. Inside a Field, it is
 * the field's control: the field's label, description and states are on it.
 */
@Directive({
    selector: "[tagGroupList]",
    exportAs: "tagGroupList",
    host: {
        "[attr.role]": "state().empty ? 'group' : 'grid'",
        "[attr.tabindex]": "state().empty ? '-1' : null",
        "[attr.aria-describedby]": "describedBy()",
        "[attr.aria-invalid]": "root.field.ariaInvalid()",
        "[attr.aria-labelledby]": "labelledBy()",
        "[attr.aria-multiselectable]":
            "root.selectionMode() === 'multiple' && !state().empty ? 'true' : null",
        "data-primitives-part": "tag-group-list",
        "[attr.data-invalid]": "root.field.data().invalid",
        "[attr.data-valid]": "root.field.data().valid",
        "[attr.data-dirty]": "root.field.data().dirty",
        "[attr.data-touched]": "root.field.data().touched",
        "[attr.data-filled]": "root.field.data().filled",
        "[attr.data-focused]": "root.field.data().focused",
        "[attr.data-empty]": "data().empty",
        "[attr.data-disabled]": "data().disabled",
        "(keydown)": "root.listKeyDown($event)",
        "(focusin)": "root.field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class TagGroupList {
    protected readonly root = injectEnclosing(
        TagGroupRoot,
        "tagGroupRoot",
        "tagGroupList",
    );
    private readonly host = registerHost(this.root.list);
    // the consumer's own static name or description wins
    private readonly ownLabelledBy = ownAttribute("aria-labelledby");
    private readonly ownDescribedBy = ownAttribute("aria-describedby");
    protected readonly labelledBy = computed(
        () => this.ownLabelledBy ?? this.root.labelledBy(),
    );
    protected readonly describedBy = computed(
        () => this.ownDescribedBy ?? this.root.field.describedBy(),
    );
    readonly state = computed<TagGroupListState>(() => ({
        empty: this.root.empty(),
        disabled: this.root.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    /** The focus left the List: the field's blur. */
    protected onFocusOut(event: FocusEvent): void {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !this.host.contains(next)) {
            this.root.field.blurred();
        }
    }
}
