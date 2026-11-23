import type { ScrollAreaOrientation } from "@fragiola/primitives/scroll-area";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ScrollAreaContext,
    ScrollAreaScrollbarContext,
} from "./scroll-area-context.ts";
import { useScrollAreaPart } from "./use-scroll-area-part.ts";

export interface ScrollAreaThumbState {
    /** The user scrolls its axis. */
    scrolling: boolean;
    orientation: ScrollAreaOrientation;
}

export type ScrollAreaThumbProps = PartProps<ScrollAreaThumbState>;

/**
 * The thumb of a Scrollbar (spec/scroll-area.md): its size is the Scrollbar's
 * `--scroll-area-thumb-*` variable, and the toolkit places it along the track.
 */
export function ScrollAreaThumb(props: ScrollAreaThumbProps) {
    const context = useRequiredContext(ScrollAreaContext, "ScrollArea.Thumb");
    const orientation = useRequiredContext(
        ScrollAreaScrollbarContext,
        "ScrollArea.Thumb",
    );
    const vertical = orientation === "vertical";
    const ref = useScrollAreaPart(
        vertical ? "thumb-y" : "thumb-x",
        context.setPart,
    );
    const scrolling = vertical
        ? context.measured.scrollingY
        : context.measured.scrollingX;
    return renderElement(
        "div",
        props,
        { scrolling, orientation },
        {
            style: vertical
                ? { height: "var(--scroll-area-thumb-height)" }
                : { width: "var(--scroll-area-thumb-width)" },
            "data-primitives-part": "scroll-area-thumb",
            "data-orientation": orientation,
            ...stateAttributes({ scrolling }),
        },
        ref,
    );
}
