import { useLayoutEffect } from "react";
import {
    type PositionerProps,
    usePositioner,
} from "../../hooks/use-positioner.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardContext } from "./hover-card-context.ts";

export interface HoverCardPositionerState {
    open: boolean;
    side: string;
    align: string;
}

export interface HoverCardPositionerProps
    extends PartProps<HoverCardPositionerState>,
        PositionerProps {}

/** Places the popup next to its anchor (spec/hover-card.md, "Positioning"). */
export function HoverCardPositioner({
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    anchor,
    ...props
}: HoverCardPositionerProps) {
    const context = useRequiredContext(
        HoverCardContext,
        "HoverCard.Positioner",
    );
    const placed = usePositioner(
        { side, align, sideOffset, alignOffset, collisionPadding, anchor },
        { side: "bottom", align: "center" },
        context.trigger,
        context.positioner,
        context.arrow,
        context.presence.mounted,
    );
    const { setPlaced } = context;
    useLayoutEffect(() => setPlaced(placed), [placed, setPlaced]);
    const state = { open: context.open, ...placed };
    return renderElement(
        "div",
        props,
        state,
        {
            role: "presentation",
            hidden: context.presence.mounted ? undefined : true,
            "data-primitives-part": "hover-card-positioner",
            ...stateAttributes({
                open: context.open,
                closed: !context.open,
                side: placed.side,
                align: placed.align,
            }),
        },
        context.setPositioner,
    );
}
