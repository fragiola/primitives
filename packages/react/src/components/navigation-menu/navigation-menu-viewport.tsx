import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { NavigationMenuContext } from "./navigation-menu-context.ts";

/** Where the open Content renders, inside the Popup (spec/navigation-menu.md). */
export function NavigationMenuViewport(
    props: PartProps<Record<string, never>>,
) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Viewport",
    );
    return renderElement(
        "div",
        props,
        {},
        { "data-primitives-part": "navigation-menu-viewport" },
        context.setViewport,
    );
}
