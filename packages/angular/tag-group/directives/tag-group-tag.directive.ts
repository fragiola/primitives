import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    input,
    untracked,
} from "@angular/core";
import {
    dataValues,
    injectEnclosing,
    injectHost,
} from "@fragiola/primitives-angular/internal";
import { TagGroupRoot } from "./tag-group-root.directive.ts";

export interface TagGroupTagState {
    selected: boolean;
    disabled: boolean;
}

/**
 * A `row`, focusable with a roving `tabindex` (spec/tag-group.md):
 * `<div tagGroupTag value="news"><div tagGroupTagCell>News</div></div>`. A press focuses it and
 * selects it by the group's mode; a disabled tag is never focused.
 */
@Directive({
    selector: "[tagGroupTag]",
    exportAs: "tagGroupTag",
    host: {
        role: "row",
        "[attr.tabindex]": "tabIndex()",
        "[attr.aria-selected]": "ariaSelected()",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "data-primitives-part": "tag-group-tag",
        "[attr.data-selected]": "data().selected",
        "[attr.data-disabled]": "data().disabled",
        "(focus)": "onFocus($event)",
        "(click)": "onClick($event)",
    },
})
export class TagGroupTag {
    /** The value it selects and removes (unique in the group). */
    readonly value = input.required<string>();
    /** Never focused, selected nor removed. */
    readonly disabled = input(false, { transform: booleanAttribute });

    protected readonly root = injectEnclosing(
        TagGroupRoot,
        "tagGroupRoot",
        "tagGroupTag",
    );
    /** The Tag's element, read when its RemoveButton removes it. */
    readonly element = injectHost();
    readonly state = computed<TagGroupTagState>(() => ({
        selected: this.root.selected().includes(this.value()),
        disabled: this.root.tagDisabled(this.value(), this.disabled()),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    /** A disabled tag never takes focus (spec/tag-group.md, "Keyboard"). */
    protected readonly tabIndex = computed(() => {
        if (this.state().disabled) {
            return null;
        }
        return this.root.tabStop() === this.element ? "0" : "-1";
    });
    protected readonly ariaSelected = computed(() => {
        if (this.root.selectionMode() === "none") {
            return null;
        }
        return this.state().selected ? "true" : "false";
    });

    constructor() {
        const element = this.element;
        const root = this.root;
        effect((onCleanup) => {
            const entry = {
                element,
                value: this.value(),
                disabled: this.disabled(),
            };
            onCleanup(untracked(() => root.register(entry)));
        });
    }

    protected onFocus(event: FocusEvent): void {
        if (event.target === this.element) {
            this.root.focused(this.element);
        }
    }

    protected onClick(event: MouseEvent): void {
        // a RemoveButton's press prevents its click: it selects nothing
        if (!event.defaultPrevented) {
            this.root.press(this.element, event);
        }
    }
}
