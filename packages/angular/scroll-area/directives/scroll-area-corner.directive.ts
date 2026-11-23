import { computed, Directive, inject } from "@angular/core";
import {
    conditionalView,
    writeAttributes,
} from "@fragiola/primitives-angular/internal";
import { ScrollAreaRoot } from "./scroll-area-root.directive.ts";

/**
 * The square where the two scrollbars meet (spec/scroll-area.md); structural, so it is rendered
 * only while both axes overflow: `<div *scrollAreaCorner>`. Sized by the Root's
 * `--scroll-area-corner-*` variables.
 */
@Directive({ selector: "[scrollAreaCorner]", exportAs: "scrollAreaCorner" })
export class ScrollAreaCorner {
    private readonly root = inject(ScrollAreaRoot);

    constructor() {
        const root = this.root;
        conditionalView(
            computed(() => {
                const measured = root.measured();
                return measured.hasOverflowX && measured.hasOverflowY;
            }),
            (corner) => {
                writeAttributes(corner, {
                    "aria-hidden": "true",
                    "data-primitives-part": "scroll-area-corner",
                });
                corner.style.setProperty("position", "absolute");
                corner.style.setProperty("bottom", "0px");
                corner.style.setProperty("inset-inline-end", "0px");
                corner.style.setProperty(
                    "width",
                    "var(--scroll-area-corner-width)",
                );
                corner.style.setProperty(
                    "height",
                    "var(--scroll-area-corner-height)",
                );
            },
        );
    }
}
