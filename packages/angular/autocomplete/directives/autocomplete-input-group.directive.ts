import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { AutocompleteRoot } from "./autocomplete-root.directive.ts";

/**
 * Holds the Input and its buttons; anchors the list: `<div autocompleteInputGroup>`. A press on
 * it, outside its buttons and the input, focuses the input (and opens the list with
 * `openOnInputClick`).
 */
@Directive({
    selector: "[autocompleteInputGroup]",
    exportAs: "autocompleteInputGroup",
    host: {
        role: "group",
        "data-primitives-part": "autocomplete-input-group",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(mousedown)": "onMouseDown($event)",
    },
})
export class AutocompleteInputGroup {
    protected readonly root = inject(AutocompleteRoot);
    readonly state = computed(() => ({
        open: this.root.overlay.open(),
        disabled: this.root.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        registerHost(this.root.inputGroup);
    }

    protected onMouseDown(event: MouseEvent): void {
        const root = this.root;
        const target = event.target as Element | null;
        const input = root.overlay.trigger();
        if (
            target === null ||
            target === input ||
            target.closest("button") !== null
        ) {
            return;
        }
        event.preventDefault();
        if (root.isDisabled()) {
            return;
        }
        input?.focus();
        if (root.openOnInputClick() && !root.overlay.open()) {
            root.setOpen(true, "input-press", event);
        }
    }
}
