import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/clipboard.md, "Anatomy". The read-only Input beside the Trigger, a square button whose
// Indicator shows a copy icon (`copy`), a check while copied (`check`) and a cross while a copy
// failed (`failed`).
export const clipboard: Recipe<
    "root" | "input" | "trigger" | "indicator" | "copy" | "check" | "failed"
> = {
    root: "inline-flex items-center gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    input: `h-(--pr-control-height) w-72 rounded-control border border-palette-line bg-palette-soft px-3 font-mono text-xs text-palette-contrast ${FOCUS_RING}`,
    trigger: `${BUTTON} size-(--pr-control-height) px-0`,
    indicator: "group inline-flex items-center justify-center",
    copy: "size-4 group-data-copied:hidden group-data-failed:hidden",
    check: "hidden size-4 group-data-copied:block",
    failed: "hidden size-4 group-data-failed:block",
};
