import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/link.md, "Anatomy". An underlined link; the current page bold and not underlined
// (`data-current`), a disabled one dimmed (`data-disabled`).
export const link: Recipe<"root" | "list"> = {
    root: `rounded-control font-primitives text-(length:--pr-size) text-palette-contrast underline underline-offset-4 decoration-palette-line hover:decoration-palette-contrast data-current:font-semibold data-current:no-underline data-disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:hover:decoration-palette-line ${FOCUS_RING}`,
    list: "flex flex-wrap items-center gap-4",
};
