import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    portalContainer,
} from "@fragiola/primitives-angular/internal";
import { PopoverRoot } from "./popover-root.directive.ts";

/** Moves the positioner to the end of `body` while the popover is open or closing. */
@Directive({ selector: "[popoverPortal]" })
export class PopoverPortal {
    /** Where the content goes (default: `document.body`). */
    readonly container = input(null, {
        alias: "popoverPortal",
        transform: portalContainer,
    });

    constructor() {
        mountPortal(
            inject(PopoverRoot).overlay.presence.mounted,
            this.container,
        );
    }
}
