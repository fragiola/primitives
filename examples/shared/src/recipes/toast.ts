import type { Recipe } from "./recipe.ts";
import { BUTTON, FOCUS_RING } from "./shared.ts";

// spec/toast.md, "Anatomy" and "Stacking": the toasts stacked at the bottom of the viewport, the
// older ones peeking behind the frontmost (collapsed, all at its height) or each at its offset
// (`data-expanded`), moved by a swipe, a queued one (`data-limited`) hidden.
const STACK = [
    "absolute bottom-0 end-0 w-full origin-bottom overflow-hidden",
    "h-[var(--toast-frontmost-height,var(--toast-height))] data-expanded:h-(--toast-height)",
    "translate-x-(--toast-swipe-movement-x)",
    "translate-y-[calc(var(--toast-swipe-movement-y)-var(--toast-index)*0.75rem)]",
    "scale-[calc(1-var(--toast-index)*0.05)]",
    "data-expanded:scale-100 data-expanded:translate-y-[calc(var(--toast-swipe-movement-y)-var(--toast-offset-y)-var(--toast-index)*0.75rem)]",
    "data-starting-style:translate-y-full data-starting-style:opacity-0 data-ending-style:opacity-0",
    "data-[swipe-direction=right]:data-ending-style:translate-x-full data-[swipe-direction=left]:data-ending-style:-translate-x-full",
    // the frontmost on top; a queued one takes no pointer
    "z-[calc(1000-var(--toast-index))] data-limited:opacity-0 data-limited:pointer-events-none",
    "transition-[translate,scale,opacity,height] duration-(--pr-motion) ease-out data-swiping:transition-none",
].join(" ");

export const toast: Recipe<
    | "trigger"
    | "viewport"
    | "root"
    | "title"
    | "description"
    | "action"
    | "close"
> = {
    trigger: BUTTON,
    viewport: `fixed bottom-4 end-4 z-50 w-80 max-w-[calc(100vw-2rem)] ${FOCUS_RING}`,
    root: `palette-raised ${STACK} flex flex-wrap items-center gap-x-2 gap-y-1 p-3 rounded-popup border border-palette-line bg-palette-base text-palette-contrast font-primitives text-(length:--pr-size) shadow-popup cursor-default select-none ${FOCUS_RING}`,
    title: "w-full text-[1em] font-semibold",
    description: "w-full text-palette-accent/85",
    action: `${BUTTON} mt-1`,
    close: `${BUTTON} mt-1`,
};
