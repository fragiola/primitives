import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/scroll-area.md, "Anatomy". The Root is the bordered box, the Viewport fills it; the
// Scrollbars are placed by their structural style (`position: absolute` at the inline end and
// the bottom) and only drawn here: a thin rail whose thumb darkens while the pointer is over the
// area or a scroll runs. The Thumb's size and transform are the toolkit's.
export const scrollArea: Recipe<
    "root" | "viewport" | "content" | "scrollbar" | "thumb" | "corner"
> = {
    root: "size-full overflow-hidden rounded-popup border border-palette-line bg-palette-base font-primitives text-(length:--pr-size) text-palette-contrast",
    viewport: `size-full rounded-popup overscroll-contain ${FOCUS_RING} focus-visible:outline-offset-[-2px]`,
    content: "flex flex-col gap-1 p-3",
    scrollbar:
        "flex rounded-full p-0.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col",
    thumb: "shrink-0 rounded-full bg-palette-line transition-colors duration-(--pr-motion) data-[orientation=vertical]:w-full data-[orientation=horizontal]:h-full in-data-hovering:bg-palette-accent data-scrolling:bg-palette-contrast",
    corner: "bg-palette-soft",
};
