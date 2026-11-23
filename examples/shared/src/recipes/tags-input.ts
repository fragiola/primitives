import type { Recipe } from "./recipe.ts";
import { BUTTON } from "./shared.ts";

// spec/tags-input.md, "Anatomy". A field box that wraps its tags before the text, ringed while the
// focus is inside; a focused tag ringed, an edited one showing its text field; the invalid border
// of a Field.
export const tagsInput: Recipe<
    | "root"
    | "control"
    | "input"
    | "tag"
    | "tag-text"
    | "tag-remove"
    | "tag-input"
    | "clear-trigger"
> = {
    root: "flex items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast data-disabled:opacity-50",
    control:
        "flex min-h-(--pr-control-height) w-80 flex-wrap items-center gap-1 rounded-control border border-palette-line bg-palette-base py-1 ps-1.5 pe-1 focus-within:outline-solid focus-within:outline-(length:--pr-focus-width) focus-within:outline-offset-2 focus-within:outline-palette-ring has-[[aria-invalid=true]]:border-2 has-[[aria-invalid=true]]:border-palette-contrast",
    input: "h-6 min-w-16 flex-1 bg-transparent px-1 text-palette-contrast outline-none",
    tag: "inline-flex h-6 items-center gap-1 rounded-control bg-palette-soft ps-2 pe-0.5 text-xs text-palette-contrast outline-hidden focus:outline-solid focus:outline-(length:--pr-focus-width) focus:outline-palette-ring data-editing:ps-0.5",
    "tag-text": "whitespace-nowrap",
    "tag-remove":
        "inline-flex size-5 items-center justify-center rounded-control text-palette-accent/85 hover:bg-palette-base",
    "tag-input":
        "h-5 w-24 rounded-control border border-palette-line bg-palette-base px-1 text-xs text-palette-contrast outline-none",
    "clear-trigger": `${BUTTON} size-(--pr-control-height) px-0 text-palette-accent/85`,
};
