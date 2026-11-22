import type { Direction } from "@fragiola/primitives/direction";
import { type ComputedRef, computed, inject } from "vue";
import { DirectionKey } from "./direction-context.ts";

/** The nearest DirectionProvider's direction, or `"ltr"` without one (spec/direction.md). */
export function useDirection(): ComputedRef<Direction> {
    const provided = inject(DirectionKey, null);
    return computed(() => provided?.() ?? "ltr");
}
