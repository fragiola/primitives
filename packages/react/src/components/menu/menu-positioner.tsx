import { useLayoutEffect } from "react";
import {
    type PositionerProps,
    usePositioner,
} from "../../hooks/use-positioner.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MenuContext } from "./menu-context.ts";

export interface MenuPositionerState {
    open: boolean;
    side: string;
    align: string;
}

export interface MenuPositionerProps
    extends PartProps<MenuPositionerState>,
        PositionerProps {}

/** Places a menu level: below its trigger, or at the end side of its submenu trigger. */
export function MenuPositioner({
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    anchor,
    ...props
}: MenuPositionerProps) {
    const context = useRequiredContext(MenuContext, "Menu.Positioner");
    const nested = context.parent !== null;
    const placed = usePositioner(
        { side, align, sideOffset, alignOffset, collisionPadding, anchor },
        // a vertical bar's menus open at its end side, as submenus (spec/menubar.md)
        nested || context.bar?.orientation === "vertical"
            ? { side: "inline-end", align: "start" }
            : { side: "bottom", align: "start" },
        context.anchor ?? context.trigger,
        context.positioner,
        null,
        context.presence.mounted,
    );
    const { setPlaced } = context;
    useLayoutEffect(() => setPlaced(placed), [placed, setPlaced]);
    return renderElement(
        "div",
        props,
        { open: context.open, ...placed },
        {
            role: "presentation",
            hidden: context.presence.mounted ? undefined : true,
            // a modal menu blocks the pointer outside; its levels take it back (spec/menu.md)
            style: context.modal ? { pointerEvents: "auto" } : undefined,
            "data-primitives-part": `${context.component}-positioner`,
            ...stateAttributes({
                open: context.open,
                closed: !context.open,
                side: placed.side,
                align: placed.align,
                nested,
            }),
        },
        context.setPositioner,
    );
}
