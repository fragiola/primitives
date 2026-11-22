import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { MenuRootBase } from "./menu-root-base.ts";

/**
 * Moves a menu level's positioner to the end of `body` while it is open or closing (always with
 * `keepMounted`).
 */
@Directive({ selector: "[menuPortal]" })
export class MenuPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*menuPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "menuPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject(MenuRootBase).overlay.presence.mounted,
            this.options,
        );
    }
}
