import type { Recipe } from "./recipe.ts";
import { COLOR_THUMB, FOCUS_RING } from "./shared.ts";

// spec/color-wheel.md, "Anatomy". The Track is the Root's circle drawn with the conic gradient
// (its CSS variable) and masked inside the inner radius (the Root's variable), so only the ring
// shows; the Thumb is a disc of the color.
export const colorWheel: Recipe<"root" | "track" | "thumb"> = {
    root: "shrink-0 data-disabled:opacity-50",
    track: "rounded-full [background:var(--color-wheel-track-background)] [mask:radial-gradient(circle_closest-side,transparent_calc(var(--color-wheel-inner-radius)-1px),#000_var(--color-wheel-inner-radius))]",
    thumb: `${COLOR_THUMB} [background:var(--color-wheel-thumb-color)] ${FOCUS_RING}`,
};
