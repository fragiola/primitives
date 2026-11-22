import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NavigationMenuContext,
    NavigationMenuItemContext,
} from "./navigation-menu-context.ts";

/** A decorative mark inside a Trigger (a chevron the recipe draws). */
export function NavigationMenuIcon(props: PartProps<{ open: boolean }>) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Icon",
    );
    const item = useRequiredContext(
        NavigationMenuItemContext,
        "NavigationMenu.Icon",
    );
    const open = context.value === item.value;
    return renderElement(
        "span",
        props,
        { open },
        {
            "aria-hidden": "true",
            "data-primitives-part": "navigation-menu-icon",
            ...stateAttributes({ "popup-open": open }),
        },
    );
}
