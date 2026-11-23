import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    overflowAttributes,
    ScrollAreaContext,
    type ScrollAreaState,
    scrollAreaState,
} from "./scroll-area-context.ts";
import { useScrollAreaPart } from "./use-scroll-area-part.ts";

export type ScrollAreaViewportProps = PartProps<ScrollAreaState>;

/**
 * The element that scrolls, natively (spec/scroll-area.md): its native scrollbars are hidden, and
 * it takes a tab stop while it overflows with nothing focusable in it.
 */
export function ScrollAreaViewport(props: ScrollAreaViewportProps) {
    const context = useRequiredContext(
        ScrollAreaContext,
        "ScrollArea.Viewport",
    );
    const ref = useScrollAreaPart("viewport", context.setPart);
    const state = scrollAreaState(context.measured);
    return renderElement(
        "div",
        props,
        state,
        {
            tabIndex: context.measured.focusable ? 0 : undefined,
            style: { overflow: "scroll", scrollbarWidth: "none" },
            "data-primitives-part": "scroll-area-viewport",
            ...stateAttributes({
                scrolling: state.scrolling,
                ...overflowAttributes(state),
            }),
        },
        ref,
    );
}
