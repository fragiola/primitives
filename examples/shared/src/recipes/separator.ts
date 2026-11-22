import type { Recipe } from "./recipe.ts";

// spec/separator.md, "Anatomy": a one-pixel line along its orientation, across its container
// when horizontal, as tall as its row when vertical.
export const separator: Recipe<"root"> = {
    root: "shrink-0 border-0 bg-palette-line data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
};
