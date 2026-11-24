import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/file-upload.md, "Anatomy". A column: the label, a dashed Dropzone (whole-pixel sizes,
// pointer tests drop on it) beside nothing interactive, the Trigger and the ClearTrigger, then the
// Items as rows (a square preview, the name and size, a delete button); a rejected Item's text in
// the accent color with a dashed border, the invalid border of a Field.
export const fileUpload: Recipe<
    | "root"
    | "label"
    | "dropzone"
    | "actions"
    | "trigger"
    | "clear-trigger"
    | "item-group"
    | "item"
    | "item-preview"
    | "item-preview-image"
    | "item-text"
    | "item-name"
    | "item-size-text"
    | "item-delete-trigger"
> = {
    root: "flex w-96 flex-col gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "text-sm font-medium",
    dropzone: `flex h-28 cursor-pointer items-center justify-center rounded-popup border-2 border-dashed border-palette-line bg-palette-base px-4 text-center text-palette-accent transition-colors duration-(--pr-motion) hover:bg-palette-soft data-drop-target:border-solid data-drop-target:border-palette-contrast data-drop-target:bg-palette-soft data-invalid:border-palette-contrast data-disabled:cursor-not-allowed data-disabled:opacity-50 ${FOCUS_RING}`,
    actions: "flex items-center gap-2",
    trigger: BUTTON,
    "clear-trigger": BUTTON,
    "item-group": "flex flex-col gap-1",
    item: "flex h-12 items-center gap-2 rounded-control border border-palette-line bg-palette-base px-2 data-rejected:border-dashed data-rejected:text-palette-accent",
    "item-preview":
        "size-8 shrink-0 overflow-hidden rounded-control bg-palette-soft",
    "item-preview-image": "size-8 object-cover",
    "item-text": "flex min-w-0 flex-1 flex-col",
    "item-name": "truncate text-sm",
    "item-size-text": "text-xs text-palette-accent",
    "item-delete-trigger": `${BUTTON} size-7 px-0 text-palette-accent/85`,
};
