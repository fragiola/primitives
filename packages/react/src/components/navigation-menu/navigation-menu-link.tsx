import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuContext } from "./navigation-menu-context.ts";

export interface NavigationMenuLinkProps
    extends PartProps<{ active: boolean }> {
    /** The link of the current page (`aria-current="page"`). */
    active?: boolean;
}

/** A link, in the List or in a Content (spec/navigation-menu.md). */
export function NavigationMenuLink({
    active = false,
    ...props
}: NavigationMenuLinkProps) {
    useRequiredContext(NavigationMenuContext, "NavigationMenu.Link");
    return renderElement(
        "a",
        props,
        { active },
        {
            "aria-current": active ? "page" : undefined,
            "data-primitives-part": "navigation-menu-link",
            ...stateAttributes({ active }),
        },
    );
}
