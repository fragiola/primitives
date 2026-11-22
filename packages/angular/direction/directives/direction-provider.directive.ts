import { Directive, forwardRef, inject, input } from "@angular/core";
import type { Direction } from "@fragiola/primitives/direction";
import { DIRECTION } from "@fragiola/primitives-angular/internal";

/** `"rtl"` gives right to left; anything else (`directionProvider` alone too) left to right. */
const toDirection = (value: unknown): Direction =>
    value === "rtl" ? "rtl" : "ltr";

/**
 * The reading direction of everything inside the consumer's own element (spec/direction.md):
 * `<div directionProvider="rtl">`. It sets no `dir` and no style, and renders nothing of its own;
 * a nested provider wins inside it. The components read it instead of their computed direction.
 */
@Directive({
    selector: "[directionProvider]",
    exportAs: "directionProvider",
    providers: [
        {
            provide: DIRECTION,
            useFactory: () =>
                inject(forwardRef(() => DirectionProvider)).direction,
        },
    ],
})
export class DirectionProvider {
    /** `"ltr"` (default) or `"rtl"`. */
    readonly direction = input<Direction, unknown>("ltr", {
        alias: "directionProvider",
        transform: toDirection,
    });
}
