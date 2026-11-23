import type {
    ScrollAreaState as Measured,
    ScrollAreaOrientation,
    ScrollAreaPart,
} from "@fragiola/primitives/scroll-area";
import { createContext } from "react";

/** What the Root, the Viewport and the Content render with (spec/scroll-area.md). */
export interface ScrollAreaState {
    /** The user scrolls the area (either axis). */
    scrolling: boolean;
    hasOverflowX: boolean;
    hasOverflowY: boolean;
    overflowXStart: boolean;
    overflowXEnd: boolean;
    overflowYStart: boolean;
    overflowYEnd: boolean;
}

export interface ScrollAreaContextValue {
    /** The toolkit's measured state. */
    measured: Measured;
    /** Registers a part's element with the toolkit's controller (`null` when it goes). */
    setPart: (part: ScrollAreaPart, element: HTMLElement | null) => void;
}

export const ScrollAreaContext = createContext<ScrollAreaContextValue | null>(
    null,
);

/** The orientation of the enclosing Scrollbar, for its Thumb. */
export const ScrollAreaScrollbarContext =
    createContext<ScrollAreaOrientation | null>(null);

/** The Root's state from the measured one. */
export function scrollAreaState(measured: Measured): ScrollAreaState {
    return {
        scrolling: measured.scrollingX || measured.scrollingY,
        hasOverflowX: measured.hasOverflowX,
        hasOverflowY: measured.hasOverflowY,
        overflowXStart: measured.overflowXStart,
        overflowXEnd: measured.overflowXEnd,
        overflowYStart: measured.overflowYStart,
        overflowYEnd: measured.overflowYEnd,
    };
}

/** The overflow attributes every part but the Thumb and the Corner carries. */
export function overflowAttributes(
    state: ScrollAreaState,
): Record<string, boolean> {
    return {
        "has-overflow-x": state.hasOverflowX,
        "has-overflow-y": state.hasOverflowY,
        "overflow-x-start": state.overflowXStart,
        "overflow-x-end": state.overflowXEnd,
        "overflow-y-start": state.overflowYStart,
        "overflow-y-end": state.overflowYEnd,
    };
}
