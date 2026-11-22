import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { SelectRoot } from "./select-root.directive.ts";

/**
 * Moves the positioner to the end of `body` while the list is open or closing (always with
 * `keepMounted`).
 */
@Directive({ selector: "[selectPortal]" })
export class SelectPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*selectPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "selectPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(inject(SelectRoot).overlay.presence.mounted, this.options);
    }
}
