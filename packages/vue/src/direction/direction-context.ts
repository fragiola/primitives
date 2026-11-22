import type { Direction } from "@fragiola/primitives/direction";
import { type InjectionKey, inject } from "vue";

/**
 * The direction a DirectionProvider gives (spec/direction.md). The components read it from here,
 * not from the `/direction` entry, which they never import (the bundle guard reads it alone).
 */
export const DirectionKey: InjectionKey<() => Direction> = Symbol("Direction");

/**
 * The enclosing provider's direction, read when it is needed (a key press, a placement), or
 * `null` without a provider: the component then reads its element's computed direction
 * (`getDirection(element, provided())`).
 */
export function useProvidedDirection(): () => Direction | null {
    const provided = inject(DirectionKey, null);
    return () => provided?.() ?? null;
}
