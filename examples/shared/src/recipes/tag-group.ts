import type { Recipe } from "./recipe.ts";

// spec/tag-group.md, "Anatomy". A wrapping row of small rounded tags: the focused one ringed, the
// selected ones filled in the contrast role, the disabled ones dimmed; a remove button inside each.
export const tagGroup: Recipe<
    "root" | "label" | "list" | "tag" | "tag-cell" | "remove-button"
> = {
    root: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "text-sm font-medium text-palette-contrast",
    list: "flex max-w-80 flex-wrap gap-1.5 outline-hidden",
    tag: "inline-flex h-7 items-center rounded-full border border-palette-line bg-palette-soft text-xs text-palette-contrast cursor-default select-none outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring data-selected:border-palette-contrast data-selected:bg-palette-contrast data-selected:text-palette-base data-disabled:opacity-50",
    "tag-cell": "inline-flex h-full items-center gap-1 ps-3 pe-1.5",
    "remove-button":
        "inline-flex size-5 items-center justify-center rounded-full text-current/85 hover:bg-palette-base/30 disabled:pointer-events-none",
};
