import type { Recipe } from "./recipe.ts";
import { COLOR_THUMB } from "./shared.ts";

// spec/color-area.md, "Anatomy". The Root draws the two-channel background (its CSS variables)
// and is 200 × 200 px, as the scenarios expect; the Thumb is a disc of the color, ringed while one
// of its hidden Inputs has the keyboard focus.
export const colorArea: Recipe<"root" | "thumb" | "input"> = {
    root: "size-50 shrink-0 rounded-control [background-image:var(--color-area-background)] [background-blend-mode:var(--color-area-background-blend-mode)] data-disabled:opacity-50",
    thumb: `${COLOR_THUMB} [background:var(--color-area-thumb-color)] has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-(length:--pr-focus-width) has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-palette-ring`,
    input: "",
};
