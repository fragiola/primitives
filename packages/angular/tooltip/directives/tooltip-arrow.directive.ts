import { computed, Directive, inject } from "@angular/core";
import {
    dataValues,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { TooltipRoot } from "./tooltip-root.directive.ts";

/** Points at the anchor; placed along the popup's edge by the positioner: `<div tooltipArrow>`. */
@Directive({
    selector: "[tooltipArrow]",
    exportAs: "tooltipArrow",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "tooltip-arrow",
        "[attr.data-side]": "data().side",
        "[attr.data-align]": "data().align",
    },
})
export class TooltipArrow {
    private readonly root = inject(TooltipRoot);
    readonly state = this.root.placed.asReadonly();
    protected readonly data = computed(() => dataValues(this.state()));

    constructor() {
        registerHost(this.root.arrow);
    }
}
