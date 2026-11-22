import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    portalContainer,
} from "@fragiola/primitives-angular/internal";
import { TooltipRoot } from "./tooltip-root.directive.ts";

/** Moves the positioner to the end of `body` while the tooltip is open or closing. */
@Directive({ selector: "[tooltipPortal]" })
export class TooltipPortal {
    /** Where the content goes (default: `document.body`). */
    readonly container = input(null, {
        alias: "tooltipPortal",
        transform: portalContainer,
    });

    constructor() {
        mountPortal(
            inject(TooltipRoot).overlay.presence.mounted,
            this.container,
        );
    }
}
