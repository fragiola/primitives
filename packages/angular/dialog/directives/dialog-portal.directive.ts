import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { DialogRoot } from "./dialog-root.directive.ts";

/**
 * Moves the backdrop, the viewport and the popup to the end of `body` while the dialog is open or
 * closing: `<ng-container *dialogPortal>`, `*dialogPortal="container"` for another element, or
 * `*dialogPortal="{ keepMounted: true }"` to keep them rendered (hidden) while closed.
 */
@Directive({ selector: "[dialogPortal]" })
export class DialogPortal {
    /** `container`, `keepMounted` (default `false`); an element: the container alone. */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "dialogPortal", transform: portalOptions },
    );

    constructor() {
        const root = inject<DialogRoot>(DialogRoot);
        mountPortal(root.overlay.presence.mounted, this.options);
    }
}
