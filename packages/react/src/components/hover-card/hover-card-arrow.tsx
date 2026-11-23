import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardContext } from "./hover-card-context.ts";

/** Points at the anchor; placed along the popup's edge by the positioner. */
export function HoverCardArrow(
    props: PartProps<{ side: string; align: string }>,
) {
    const context = useRequiredContext(HoverCardContext, "HoverCard.Arrow");
    return renderElement(
        "div",
        props,
        context.placed,
        {
            "aria-hidden": "true",
            "data-primitives-part": "hover-card-arrow",
            ...stateAttributes({
                open: context.open,
                closed: !context.open,
                side: context.placed.side,
                align: context.placed.align,
            }),
        },
        context.setArrow,
    );
}
