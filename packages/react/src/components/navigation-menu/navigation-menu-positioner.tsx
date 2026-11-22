import { type CSSProperties, useLayoutEffect } from "react";
import {
    type PositionerProps,
    usePositioner,
} from "../../hooks/use-positioner.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuContext } from "./navigation-menu-context.ts";

export interface NavigationMenuPositionerState {
    open: boolean;
    side: string;
    align: string;
}

export interface NavigationMenuPositionerProps
    extends PartProps<NavigationMenuPositionerState>,
        PositionerProps {}

/** Places the popup next to the open item's Trigger (spec/navigation-menu.md, "Positioning"). */
export function NavigationMenuPositioner({
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    anchor,
    style,
    ...props
}: NavigationMenuPositionerProps) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Positioner",
    );
    const open = context.value !== null;
    const placed = usePositioner(
        { side, align, sideOffset, alignOffset, collisionPadding, anchor },
        { side: "bottom", align: "center" },
        context.activeTrigger,
        context.positioner,
        context.arrow,
        context.presence.mounted,
    );
    const { setPlaced } = context;
    useLayoutEffect(() => setPlaced(placed), [placed, setPlaced]);
    const state = { open, ...placed };
    const { size } = context;
    const resolvedStyle = typeof style === "function" ? style(state) : style;
    return renderElement(
        "div",
        {
            ...props,
            style: {
                ...(size
                    ? {
                          "--positioner-width": `${size.width}px`,
                          "--positioner-height": `${size.height}px`,
                      }
                    : {}),
                ...resolvedStyle,
            } as CSSProperties,
        },
        state,
        {
            role: "presentation",
            "data-primitives-part": "navigation-menu-positioner",
            ...stateAttributes({
                open,
                closed: !open,
                side: placed.side,
                align: placed.align,
            }),
        },
        context.setPositioner,
    );
}
