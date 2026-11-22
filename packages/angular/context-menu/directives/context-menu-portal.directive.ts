import { Directive, inject, input } from "@angular/core";
import {
    mountPortal,
    type OverlayPortalOptions,
    portalOptions,
} from "@fragiola/primitives-angular/internal";
import { MenuRootBase } from "@fragiola/primitives-angular/menu";

/**
 * Menu's Portal: moves a context menu level's positioner to the end of `body` while it is open or
 * closing: `<ng-container *contextMenuPortal>`, or `*contextMenuPortal="{ keepMounted: true }"`.
 */
@Directive({ selector: "[contextMenuPortal]" })
export class ContextMenuPortal {
    /**
     * `container` (default: `document.body`), `keepMounted` (default `false`: rendered, hidden, while
     * closed); an element: the container alone (`*contextMenuPortal="element"`).
     */
    readonly options = input<OverlayPortalOptions, unknown>(
        {},
        { alias: "contextMenuPortal", transform: portalOptions },
    );

    constructor() {
        mountPortal(
            inject(MenuRootBase).overlay.presence.mounted,
            this.options,
        );
    }
}
