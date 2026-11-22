// Adapted from the POC (@poc/styles, src/recipes/dialog.ts).
import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING, POPUP_MOTION } from "./shared.ts";

// spec/dialog.md, "Anatomy". The viewport covers the page (a press on it outside the popup is an
// outside press); the popup centres itself in it as without one.
export const dialog: Recipe<
    | "trigger"
    | "backdrop"
    | "viewport"
    | "popup"
    | "title"
    | "description"
    | "close"
> = {
    trigger: BUTTON,
    backdrop:
        "fixed inset-0 bg-backdrop transition-opacity duration-(--pr-motion) data-starting-style:opacity-0 data-ending-style:opacity-0",
    viewport: "fixed inset-0",
    popup: `palette-raised fixed top-1/2 start-1/2 -translate-y-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-(--pr-popup-width) max-w-[calc(100vw-2rem)] flex flex-col gap-(--pr-gap) p-(--pr-popup-padding) rounded-popup border border-palette-line bg-palette-base text-palette-contrast font-primitives text-(length:--pr-size) shadow-popup ${POPUP_MOTION} ${FOCUS_RING}`,
    title: "text-[1.25em] font-semibold",
    description: "text-palette-accent/85",
    close: BUTTON,
};
