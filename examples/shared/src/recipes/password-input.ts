import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/password-input.md, "Anatomy". One bordered box (ringed while the focus is inside) holding
// the Input and, at its inline end, the VisibilityTrigger, whose eye icon (`show`) turns into a
// crossed one (`hide`) while the text is shown; the invalid border of a Field.
export const passwordInput: Recipe<
    "root" | "input" | "visibility-trigger" | "show" | "hide"
> = {
    root: "inline-flex h-(--pr-control-height) w-64 items-stretch overflow-hidden rounded-control border border-palette-line bg-palette-base font-primitives text-(length:--pr-size) text-palette-contrast focus-within:outline-solid focus-within:outline-(length:--pr-focus-width) focus-within:outline-offset-2 focus-within:outline-palette-ring data-disabled:opacity-50 has-[[aria-invalid=true]]:border-2 has-[[aria-invalid=true]]:border-palette-contrast",
    input: "min-w-0 flex-1 bg-transparent px-3 text-palette-contrast outline-hidden",
    "visibility-trigger": `group inline-flex w-(--pr-control-height) shrink-0 items-center justify-center text-palette-accent hover:bg-palette-soft disabled:opacity-50 ${FOCUS_RING}`,
    show: "size-4 group-data-visible:hidden",
    hide: "hidden size-4 group-data-visible:block",
};
