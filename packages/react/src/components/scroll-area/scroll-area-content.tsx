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

export type ScrollAreaContentProps = PartProps<ScrollAreaState>;

/** The scrolled content, measured when it resizes (spec/scroll-area.md). */
export function ScrollAreaContent(props: ScrollAreaContentProps) {
    const context = useRequiredContext(ScrollAreaContext, "ScrollArea.Content");
    const ref = useScrollAreaPart("content", context.setPart);
    const state = scrollAreaState(context.measured);
    return renderElement(
        "div",
        props,
        state,
        {
            role: "presentation",
            style: { minWidth: "fit-content" },
            "data-primitives-part": "scroll-area-content",
            ...stateAttributes({
                scrolling: state.scrolling,
                ...overflowAttributes(state),
            }),
        },
        ref,
    );
}
