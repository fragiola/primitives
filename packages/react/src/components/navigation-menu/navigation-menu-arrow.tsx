import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuContext } from "./navigation-menu-context.ts";

/** Points at the open item's Trigger; placed along the popup's edge by the positioner. */
export function NavigationMenuArrow(
    props: PartProps<{ side: string; align: string }>,
) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Arrow",
    );
    const open = context.value !== null;
    return renderElement(
        "div",
        props,
        context.placed,
        {
            "aria-hidden": "true",
            "data-primitives-part": "navigation-menu-arrow",
            ...stateAttributes({
                open,
                closed: !open,
                side: context.placed.side,
                align: context.placed.align,
            }),
        },
        context.setArrow,
    );
}
