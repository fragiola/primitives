import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { CascadeSelectRoot } from "./cascade-select-root.directive.ts";

/**
 * Moves the positioner to the end of `body` while the popup is open or closing (always with
 * `keepMounted`).
 */
@Directive({ selector: "[cascadeSelectPortal]" })
export class CascadeSelectPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*cascadeSelectPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "cascadeSelectPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject(CascadeSelectRoot).overlay.presence.mounted,
            this.options,
        );
    }
}
