import type { ScrollAreaOrientation } from "@fragiola/primitives/scroll-area";
import type { CSSProperties } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    overflowAttributes,
    ScrollAreaContext,
    ScrollAreaScrollbarContext,
    type ScrollAreaState,
    scrollAreaState,
} from "./scroll-area-context.ts";
import { useScrollAreaPart } from "./use-scroll-area-part.ts";

export interface ScrollAreaScrollbarState extends ScrollAreaState {
    /** A mouse or pen is over the Root. */
    hovering: boolean;
    orientation: ScrollAreaOrientation;
}

export interface ScrollAreaScrollbarProps
    extends PartProps<ScrollAreaScrollbarState> {
    /** Its axis (default `vertical`). */
    orientation?: ScrollAreaOrientation;
    /** Rendered even when its axis does not overflow (default `false`). */
    keepMounted?: boolean;
}

const VERTICAL: CSSProperties = {
    top: 0,
    bottom: "var(--scroll-area-corner-height)",
    insetInlineEnd: 0,
};

const HORIZONTAL: CSSProperties = {
    insetInlineStart: 0,
    insetInlineEnd: "var(--scroll-area-corner-width)",
    bottom: 0,
};

/**
 * The track of one axis (spec/scroll-area.md): `aria-hidden`, rendered while its axis
 * overflows; a press on it scrolls, a drag of its Thumb scrolls (the toolkit's listeners).
 */
export function ScrollAreaScrollbar({
    orientation = "vertical",
    keepMounted = false,
    ...props
}: ScrollAreaScrollbarProps) {
    const context = useRequiredContext(
        ScrollAreaContext,
        "ScrollArea.Scrollbar",
    );
    const { measured } = context;
    const vertical = orientation === "vertical";
    const shown =
        keepMounted ||
        (vertical ? measured.hasOverflowY : measured.hasOverflowX);
    const ref = useScrollAreaPart(
        shown ? (vertical ? "scrollbar-y" : "scrollbar-x") : null,
        context.setPart,
    );
    if (!shown) {
        return null;
    }
    const base = scrollAreaState(measured);
    const state: ScrollAreaScrollbarState = {
        ...base,
        scrolling: vertical ? measured.scrollingY : measured.scrollingX,
        hovering: measured.hovering,
        orientation,
    };
    return (
        <ScrollAreaScrollbarContext.Provider value={orientation}>
            {renderElement(
                "div",
                props,
                state,
                {
                    "aria-hidden": "true",
                    style: {
                        position: "absolute",
                        touchAction: "none",
                        userSelect: "none",
                        visibility: measured.measured ? undefined : "hidden",
                        ...(vertical ? VERTICAL : HORIZONTAL),
                    },
                    "data-primitives-part": "scroll-area-scrollbar",
                    "data-orientation": orientation,
                    ...stateAttributes({
                        hovering: state.hovering,
                        scrolling: state.scrolling,
                        ...overflowAttributes(base),
                    }),
                },
                ref,
            )}
        </ScrollAreaScrollbarContext.Provider>
    );
}
