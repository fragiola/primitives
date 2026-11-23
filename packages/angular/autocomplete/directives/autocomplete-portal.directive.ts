import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { AutocompleteRoot } from "./autocomplete-root.directive.ts";

/**
 * Moves the positioner to the end of `body` while the list is open or closing (always with
 * `keepMounted`): `*autocompletePortal`.
 */
@Directive({ selector: "[autocompletePortal]" })
export class AutocompletePortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*autocompletePortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "autocompletePortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject(AutocompleteRoot).overlay.presence.mounted,
            this.options,
        );
    }
}
