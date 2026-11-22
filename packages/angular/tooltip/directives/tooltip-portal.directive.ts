import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { TooltipRoot } from "./tooltip-root.directive.ts";

/**
 * Moves the positioner to the end of `body` while the tooltip is open or closing (always with
 * `keepMounted`).
 */
@Directive({ selector: "[tooltipPortal]" })
export class TooltipPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*tooltipPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "tooltipPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject<TooltipRoot>(TooltipRoot).overlay.presence.mounted,
            this.options,
        );
    }
}
