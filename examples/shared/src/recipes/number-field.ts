import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/number-field.md, "Anatomy". The Group is one bordered control: the buttons at its inline
// ends, the Input between them; an invalid field gets the heavier contrast border (as Field's
// control). The ScrubArea shows a resize cursor; the ScrubAreaCursor is a small mark at the
// virtual pointer, placed by its structural style.
export const numberField: Recipe<
    | "root"
    | "group"
    | "input"
    | "increment"
    | "decrement"
    | "scrubArea"
    | "scrubAreaCursor"
> = {
    root: "flex flex-col items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    group: "inline-flex h-(--pr-control-height) items-stretch overflow-hidden rounded-control border border-palette-line bg-palette-base data-invalid:border-2 data-invalid:border-palette-contrast data-disabled:opacity-50 focus-within:outline-solid focus-within:outline-(length:--pr-focus-width) focus-within:outline-offset-2 focus-within:outline-palette-ring",
    input: "w-28 bg-transparent px-3 text-center tabular-nums text-palette-contrast outline-hidden",
    increment: `w-(--pr-control-height) border-s border-palette-line text-palette-contrast hover:bg-palette-soft disabled:opacity-50 ${FOCUS_RING}`,
    decrement: `w-(--pr-control-height) border-e border-palette-line text-palette-contrast hover:bg-palette-soft disabled:opacity-50 ${FOCUS_RING}`,
    scrubArea: "inline-flex cursor-ew-resize items-center gap-2 font-medium",
    scrubAreaCursor:
        "block size-3 -translate-1/2 rounded-full bg-palette-contrast",
};
