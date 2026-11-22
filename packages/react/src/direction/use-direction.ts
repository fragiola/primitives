import type { Direction } from "@fragiola/primitives/direction";
import { useContext } from "react";
import { DirectionContext } from "./direction-context.ts";

/** The nearest DirectionProvider's direction, or `"ltr"` without one (spec/direction.md). */
export function useDirection(): Direction {
    return useContext(DirectionContext) ?? "ltr";
}
