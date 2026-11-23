import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { AutocompleteRoot } from "./autocomplete-root.directive.ts";

/** Toggles the list; not in the tab order, keeps focus in the input: `<button autocompleteTrigger>`. */
@Directive({
    selector: "[autocompleteTrigger]",
    exportAs: "autocompleteTrigger",
    host: {
        type: "button",
        tabindex: "-1",
        "data-primitives-part": "autocomplete-trigger",
        "[attr.disabled]": "data().disabled",
        "[attr.aria-expanded]": "String(state().open)",
        "[attr.aria-controls]": "root.listId",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(pointerdown)": "$event.preventDefault()",
        "(click)": "onClick($event)",
    },
})
export class AutocompleteTrigger {
    protected readonly root = inject(AutocompleteRoot);
    readonly state = computed(() => ({
        open: this.root.overlay.open(),
        disabled: this.root.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));
    protected readonly String = String;

    constructor() {
        registerHost(this.root.button);
    }

    protected onClick(event: MouseEvent): void {
        const root = this.root;
        root.pending.set(null);
        root.setOpen(!root.overlay.open(), "trigger-press", event);
        root.overlay.trigger()?.focus();
    }
}
