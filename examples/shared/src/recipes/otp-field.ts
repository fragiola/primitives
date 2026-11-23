import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/otp-field.md, "Anatomy": a row of square slots (in the document's direction), each one
// character, centered; a filled slot gets the contrast border, an invalid field the heavier one.
export const otpField: Recipe<"root" | "input"> = {
    root: "inline-flex items-center gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    input: `size-(--pr-control-height) rounded-control border border-palette-line bg-palette-base text-center text-palette-contrast tabular-nums caret-transparent data-filled:border-palette-contrast data-invalid:border-2 data-invalid:border-palette-contrast data-disabled:opacity-50 ${FOCUS_RING}`,
};
