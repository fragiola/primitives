import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { ComboboxRoot } from "./combobox-root.directive.ts";

/** Holds the Input and its buttons; anchors the list (spec/combobox.md): `<div comboboxInputGroup>`. */
@Directive({
    selector: "[comboboxInputGroup]",
    exportAs: "comboboxInputGroup",
    host: {
        role: "group",
        "data-primitives-part": "combobox-input-group",
        "[attr.data-popup-open]": "data().open",
        "[attr.data-disabled]": "data().disabled",
        "(mousedown)": "root.pressToOpen($event)",
    },
})
export class ComboboxInputGroup {
    protected readonly root = inject(ComboboxRoot);
    readonly state = computed(() => ({
        open: this.root.overlay.open(),
        disabled: this.root.isDisabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        registerHost(this.root.inputGroup);
    }
}
