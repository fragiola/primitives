import { Directive, inject, input } from "@angular/core";
import { DialogRootBase } from "@fragiola/primitives-angular/dialog";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";

/**
 * Dialog's Portal: moves the backdrop, the viewport and the popup to the end of `body` while the
 * drawer is open or closing: `<ng-container *drawerPortal>`, or
 * `*drawerPortal="{ keepMounted: true }"` to keep them rendered (hidden) while closed.
 */
@Directive({ selector: "[drawerPortal]" })
export class DrawerPortal {
    /** `container`, `keepMounted` (default `false`); an element: the container alone. */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "drawerPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject<DialogRootBase>(DialogRootBase).overlay.presence.mounted,
            this.options,
        );
    }
}
