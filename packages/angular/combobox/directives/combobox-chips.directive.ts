import { Directive, inject } from "@angular/core";
import { registerHost } from "@fragiola/primitives-angular/internal";
import { ComboboxRoot } from "./combobox-root.directive.ts";

/**
 * `multiple`: holds the chips and the Input; a `toolbar` while it holds a chip (spec/combobox.md):
 * `<div comboboxChips>`.
 */
@Directive({
    selector: "[comboboxChips]",
    exportAs: "comboboxChips",
    host: {
        "data-primitives-part": "combobox-chips",
        "[attr.role]": "root.values().length > 0 ? 'toolbar' : null",
        "(mousedown)": "root.pressToOpen($event)",
    },
})
export class ComboboxChips {
    protected readonly root = inject(ComboboxRoot);

    constructor() {
        registerHost(this.root.chips);
    }
}
