import type { Recipe } from "./recipe.ts";

// spec/avatar.md, "Anatomy". The Root is a fixed-size round box, so neither the Fallback nor the
// loaded Image moves the layout; both fill it.
export const avatar: Recipe<"root" | "image" | "fallback"> = {
    root: "inline-flex size-10 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-palette-soft align-middle font-primitives text-(length:--pr-size) font-medium text-palette-contrast",
    image: "size-full object-cover",
    fallback: "flex size-full items-center justify-center",
};
