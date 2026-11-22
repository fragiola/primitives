import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { ComboboxRoot } from "./combobox-root.directive.ts";

/**
 * Moves the positioner to the end of `body` while the list is open or closing (always with
 * `keepMounted`): `*comboboxPortal`.
 */
@Directive({ selector: "[comboboxPortal]" })
export class ComboboxPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*comboboxPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "comboboxPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject(ComboboxRoot).overlay.presence.mounted,
            this.options,
        );
    }
}
