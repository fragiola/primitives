import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { NavigationMenuRoot } from "./navigation-menu-root.directive.ts";

/**
 * Moves the Backdrop and the Positioner to the end of `body` while a Content is open:
 * `<ng-container *navigationMenuPortal>`.
 */
@Directive({ selector: "[navigationMenuPortal]" })
export class NavigationMenuPortal {
    /** `container` (default: `document.body`); an element: the container alone. */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "navigationMenuPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(inject(NavigationMenuRoot).presence.mounted, this.options);
    }
}
