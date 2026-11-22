import { computed, inject, type Signal } from "@angular/core";
import type { Direction } from "@fragiola/primitives/direction";
import { DIRECTION } from "@fragiola/primitives-angular/internal";

/**
 * The nearest provider's direction, or `"ltr"` without one (spec/direction.md), in an injection
 * context (a constructor or a field initializer).
 */
export function injectDirection(): Signal<Direction> {
    return (
        inject(DIRECTION, { optional: true }) ??
        computed<Direction>(() => "ltr")
    );
}
