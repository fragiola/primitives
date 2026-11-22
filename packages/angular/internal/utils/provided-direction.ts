import { InjectionToken, inject, type Signal } from "@angular/core";
import type { Direction } from "@fragiola/primitives/direction";

/**
 * The direction a DirectionProvider gives (spec/direction.md): provided by the `/direction`
 * entry's `[directionProvider]` and `provideDirection()`, read by the components here, so no
 * component imports the provider's entry (D8).
 */
export const DIRECTION = new InjectionToken<Signal<Direction>>("DIRECTION");

/**
 * The enclosing provider's direction, as a getter (`null` without a provider), in an injection
 * context: a component passes it to `getDirection(element, provided())`, read when it needs the
 * direction (a key press, a positioning).
 */
export function injectProvidedDirection(): () => Direction | null {
    const provided = inject(DIRECTION, { optional: true });
    return () => provided?.() ?? null;
}
