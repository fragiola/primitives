import { popover } from "./popover.ts";
import type { Recipe } from "./recipe.ts";
import { FOCUS_RING } from "./shared.ts";

// spec/navigation-menu.md, "Anatomy". The popup takes the open Content's size (`--popup-width`,
// `--popup-height`) and transitions to the next one's; the Contents are laid out absolutely in the
// Viewport, so the entering and the exiting one overlap, and slide along the activation direction.
const ITEM = `inline-flex items-center gap-1.5 h-(--pr-control-height) px-3 rounded-control font-primitives text-(length:--pr-size) font-medium text-palette-contrast transition-colors duration-(--pr-motion) hover:bg-palette-soft ${FOCUS_RING}`;

export const navigationMenu: Recipe<
    | "root"
    | "list"
    | "item"
    | "trigger"
    | "icon"
    | "link"
    | "content-link"
    | "content-list"
    | "content-grid"
    | "backdrop"
    | "positioner"
    | "popup"
    | "viewport"
    | "content"
    | "arrow"
> = {
    root: "relative",
    list: "flex items-center gap-1 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
    item: "flex",
    trigger: `${ITEM} data-popup-open:bg-palette-soft data-[orientation=vertical]:justify-between`,
    icon: "inline-block size-1.5 border-e-[1.5px] border-b-[1.5px] border-current rotate-45 -translate-y-px transition-transform duration-(--pr-motion) data-popup-open:rotate-[225deg] data-popup-open:translate-y-px",
    link: `${ITEM} data-active:underline`,
    // the links inside a Content
    "content-link": `block rounded-control px-2 py-1.5 font-primitives text-(length:--pr-size) text-palette-contrast hover:bg-palette-soft data-active:font-semibold ${FOCUS_RING}`,
    "content-list": "flex flex-col gap-0.5 w-48",
    "content-grid": "grid grid-cols-2 gap-0.5 w-80",
    backdrop:
        "fixed inset-0 transition-opacity duration-(--pr-motion) data-starting-style:opacity-0 data-ending-style:opacity-0",
    positioner: "z-50",
    popup: "palette-raised relative box-content w-(--popup-width) h-(--popup-height) max-w-(--available-width) bg-palette-base text-palette-contrast border border-palette-line rounded-popup shadow-popup origin-(--transform-origin) transition-[opacity,scale,width,height] duration-(--pr-motion) data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95",
    viewport: "relative size-full overflow-hidden rounded-popup",
    content:
        "absolute top-0 start-0 w-max p-2 transition-[opacity,translate] duration-(--pr-motion) data-starting-style:opacity-0 data-ending-style:opacity-0 data-[activation-direction=right]:data-starting-style:translate-x-8 data-[activation-direction=right]:data-ending-style:-translate-x-8 data-[activation-direction=left]:data-starting-style:-translate-x-8 data-[activation-direction=left]:data-ending-style:translate-x-8",
    arrow: popover.arrow,
};
