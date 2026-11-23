import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { HoverCardRoot } from "./hover-card-root.directive.ts";

/**
 * Moves the positioner to the end of `body` while the card is open or closing (always with
 * `keepMounted`).
 */
@Directive({ selector: "[hoverCardPortal]" })
export class HoverCardPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*hoverCardPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "hoverCardPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject<HoverCardRoot>(HoverCardRoot).overlay.presence.mounted,
            this.options,
        );
    }
}
