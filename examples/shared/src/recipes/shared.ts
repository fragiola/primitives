// Adapted from the POC (@poc/styles, src/recipes/shared.ts). Pieces several recipes share, on the
// palette roles and the themes' shape tokens (--pr-*). Logical properties only (RTL-safe), no
// !important.

/**
 * A focus ring on keyboard focus. In Tailwind v4, `outline-hidden` sets `--tw-outline-style` to
 * `none`, which the outline width reads, so the ring states its style again (`outline-solid`).
 */
export const FOCUS_RING =
    "outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring";

/** A neutral button (triggers, close). */
export const BUTTON = `inline-flex items-center justify-center gap-2 h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-primitives text-(length:--pr-size) font-medium transition-colors duration-(--pr-motion) hover:bg-palette-soft data-disabled:opacity-50 disabled:opacity-50 ${FOCUS_RING}`;

/** The enter and exit states of an overlay (`data-starting-style`, `data-ending-style`). */
export const POPUP_MOTION =
    "transition-[opacity,scale] duration-(--pr-motion) data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95";
