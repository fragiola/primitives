import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/editable.md, "Anatomy". The Preview is the text itself (a soft background on hover, the
// placeholder and a disabled text in the accent role: a dimmed text would fail its contrast), the
// Input a field box of the same size; the triggers are small square buttons after the Area.
export const editable: Recipe<
    | "root"
    | "area"
    | "preview"
    | "input"
    | "edit-trigger"
    | "submit-trigger"
    | "cancel-trigger"
> = {
    root: "inline-flex items-center gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    area: "inline-flex min-w-48 items-center",
    preview: `inline-flex h-(--pr-control-height) min-w-48 items-center whitespace-pre rounded-control px-2 hover:bg-palette-soft data-placeholder:text-palette-accent data-disabled:text-palette-accent data-disabled:hover:bg-transparent data-readonly:hover:bg-transparent ${FOCUS_RING}`,
    input: `h-(--pr-control-height) w-56 rounded-control border border-palette-line bg-palette-base px-2 text-palette-contrast data-invalid:border-2 data-invalid:border-palette-contrast [textarea&]:h-20 [textarea&]:py-1 ${FOCUS_RING}`,
    "edit-trigger": `${BUTTON} size-(--pr-control-height) px-0`,
    "submit-trigger": `${BUTTON} size-(--pr-control-height) px-0`,
    "cancel-trigger": `${BUTTON} size-(--pr-control-height) px-0`,
};
