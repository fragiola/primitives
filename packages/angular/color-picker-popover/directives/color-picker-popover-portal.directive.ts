import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { ColorPickerPopoverRoot } from "./color-picker-popover-root.directive.ts";

/**
 * Moves the positioner to the end of `body` while the popup is open or closing (always with
 * `keepMounted`): `<div *colorPickerPopoverPortal>`.
 */
@Directive({ selector: "[colorPickerPopoverPortal]" })
export class ColorPickerPopoverPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*colorPickerPopoverPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "colorPickerPopoverPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject(ColorPickerPopoverRoot).overlay.presence.mounted,
            this.options,
        );
    }
}
