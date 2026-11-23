import { Directive, input, signal } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";

/**
 * Renders the Viewport at the end of `body` (or `container`), in the browser only
 * (spec/toast.md): `<ng-container *toastPortal>`.
 */
@Directive({ selector: "[toastPortal]" })
export class ToastPortal {
    /** `container` (default: `document.body`); an element: the container alone. */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "toastPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(signal(true), this.options);
    }
}
