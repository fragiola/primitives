import { computed, Directive, inject, input } from "@angular/core";
import { conditionalView } from "@fragiola/primitives-angular/internal";
import { ListboxItem } from "./listbox-item.directive.ts";

/**
 * Marks a selected item, hidden from assistive technologies (spec/listbox.md); structural, so it
 * is rendered only while its item is selected: `<span *listboxItemIndicator>✓</span>`, or
 * `*listboxItemIndicator="true"` to keep it. The directive writes its attributes on the element
 * it renders.
 */
@Directive({
    selector: "[listboxItemIndicator]",
    exportAs: "listboxItemIndicator",
})
export class ListboxItemIndicator {
    private readonly item = inject(ListboxItem);
    /** Rendered while the item is not selected too. */
    readonly keepMounted = input(false, {
        alias: "listboxItemIndicator",
        // `*listboxItemIndicator` alone gives "": not kept
        transform: (value: unknown) => value === true || value === "true",
    });
    readonly state = computed(() => ({
        selected: this.item.state().selected,
    }));
    protected readonly element = conditionalView(
        computed(() => this.state().selected || this.keepMounted()),
        (element) => {
            element.setAttribute("aria-hidden", "true");
            element.setAttribute(
                "data-primitives-part",
                "listbox-item-indicator",
            );
        },
    );
}
