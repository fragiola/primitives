import {
    afterRenderEffect,
    computed,
    Directive,
    inject,
    untracked,
} from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import {
    type AutocompleteItemValue,
    AutocompleteRoot,
} from "./autocomplete-root.directive.ts";

/**
 * The `listbox`: `<div autocompleteList #list="autocompleteList">`. With the Root's `items`, its
 * `entries()` are the matching suggestions, or groups with their matching suggestions: the
 * consumer renders them with `@for (entry of list.entries(); ...)`. Applies the highlight the
 * keyboard or the typing asked for once its suggestions render, and drops a highlight whose
 * suggestion is gone (new `items`).
 */
@Directive({
    selector: "[autocompleteList]",
    exportAs: "autocompleteList",
    host: {
        role: "listbox",
        "data-primitives-part": "autocomplete-list",
        "[attr.id]": "root.listId",
        "[attr.data-empty]": "data().empty",
    },
})
export class AutocompleteList {
    protected readonly root = inject(AutocompleteRoot);
    /** The matching entries (with the Root's `items`). */
    readonly entries = computed<readonly AutocompleteItemValue[]>(() =>
        this.root.entries(),
    );
    readonly state = computed(() => ({ empty: this.root.empty() }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        const root = this.root;
        registerHost(root.list);
        afterRenderEffect(() => {
            const list = root.list();
            const pending = root.pending();
            root.itemCount();
            root.entries();
            const open = root.overlay.open();
            if (list === null) {
                return;
            }
            untracked(() => {
                // the rendered options register after the list: wait for every one of them
                if (!root.itemsRegistered()) {
                    return;
                }
                const items = root.orderedItems();
                if (pending !== null && open) {
                    root.pending.set(null);
                    if (pending === "complete") {
                        const typed = root.value().toLowerCase();
                        const match = items.find(
                            (item) =>
                                !item.disabled &&
                                root
                                    .label(item.value)
                                    .toLowerCase()
                                    .startsWith(typed),
                        );
                        if (match !== undefined) {
                            root.complete(match);
                        }
                        return;
                    }
                    const target =
                        pending === "first" ? items[0] : items.at(-1);
                    root.highlight(target?.id ?? null, "keyboard");
                    return;
                }
                const highlighted = root.highlighted();
                if (
                    highlighted !== null &&
                    !items.some((item) => item.id === highlighted)
                ) {
                    root.highlight(null, "keyboard");
                }
            });
        });
    }
}
