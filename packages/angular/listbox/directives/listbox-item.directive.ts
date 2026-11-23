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
    injectId,
} from "@fragiola/primitives-angular/internal";
import { ListboxRoot } from "./listbox-root.directive.ts";

export interface ListboxItemState {
    selected: boolean;
    highlighted: boolean;
    disabled: boolean;
}

/**
 * An `option`, focusable with a roving `tabindex` (spec/listbox.md):
 * `<div listboxItem value="apple">Apple</div>`. A press focuses it and selects by the list's
 * model and its modifiers.
 */
@Directive({
    selector: "[listboxItem]",
    exportAs: "listboxItem",
    host: {
        role: "option",
        "data-primitives-part": "listbox-item",
        "[attr.id]": "itemId",
        "[attr.tabindex]": "tabIndex()",
        "[attr.aria-selected]": "state().selected ? 'true' : 'false'",
        "[attr.aria-disabled]": "state().disabled ? 'true' : null",
        "[attr.data-selected]": "data().selected",
        "[attr.data-highlighted]": "data().highlighted",
        "[attr.data-disabled]": "data().disabled",
        "(focus)": "root.focused(host)",
        "(mousedown)": "onMouseDown($event)",
        "(click)": "root.press(host, $event)",
    },
})
export class ListboxItem {
    /** The value it selects. */
    readonly value = input.required<string>();
    /** Takes focus, never the selection. */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The text typeahead matches (default: its text content). */
    readonly label = input<string | undefined>(undefined);

    protected readonly root = injectEnclosing(
        ListboxRoot,
        "listboxRoot",
        "listboxItem",
    );
    protected readonly host = injectHost();
    protected readonly itemId = injectId("primitives-listbox-item");
    readonly state = computed<ListboxItemState>(() => ({
        selected: this.root.selected().includes(this.value()),
        highlighted: this.root.highlighted() === this.host,
        disabled: this.disabled() || this.root.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    /** A disabled list's options take no focus at all; before the items are known, `-1`. */
    protected readonly tabIndex = computed(() => {
        if (this.root.isDisabled()) {
            return null;
        }
        return this.root.tabStop() === this.host ? 0 : -1;
    });

    constructor() {
        const host = this.host;
        const root = this.root;
        effect((onCleanup) => {
            const entry = {
                element: host,
                value: this.value(),
                label: this.label(),
                disabled: this.disabled(),
            };
            onCleanup(untracked(() => root.register(entry)));
        });
    }

    /** A Shift press selects a range, not the page's text. */
    protected onMouseDown(event: MouseEvent): void {
        if (event.shiftKey) {
            event.preventDefault();
        }
    }
}
