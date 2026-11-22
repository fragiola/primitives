import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { PopoverRoot } from "./popover-root.directive.ts";

/**
 * Moves the positioner to the end of `body` while the popover is open or closing (always with
 * `keepMounted`).
 */
@Directive({ selector: "[popoverPortal]" })
export class PopoverPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*popoverPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "popoverPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject<PopoverRoot>(PopoverRoot).overlay.presence.mounted,
            this.options,
        );
    }
}
