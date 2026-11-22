import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { DATE_PICKER } from "../utils/date-picker-state.ts";

/**
 * Moves the positioner to the end of `body` while the picker is open or closing (always with
 * `keepMounted`).
 */
@Directive({ selector: "[datePickerPortal]" })
export class DatePickerPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*datePickerPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "datePickerPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(inject(DATE_PICKER).overlay.presence.mounted, this.options);
    }
}
