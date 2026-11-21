import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { PopoverRoot } from "./popover-root.directive.ts";

/** Points at the anchor; placed along the popup's edge by the positioner: `<div popoverArrow>`. */
@Directive({
    selector: "[popoverArrow]",
    exportAs: "popoverArrow",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "popover-arrow",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class PopoverArrow {
    private readonly root = inject(PopoverRoot);
    readonly state = this.root.placed.asReadonly();
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        registerHost(this.root.arrow);
    }
}
