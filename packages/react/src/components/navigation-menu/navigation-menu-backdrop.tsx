import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuContext } from "./navigation-menu-context.ts";

/** Covers the page while a Content is open; decorative. */
export function NavigationMenuBackdrop(props: PartProps<{ open: boolean }>) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Backdrop",
    );
    const open = context.value !== null;
    const status = context.presence.status;
    return renderElement(
        "div",
        props,
        { open },
        {
            "aria-hidden": "true",
            "data-primitives-part": "navigation-menu-backdrop",
            ...stateAttributes({
                open,
                closed: !open,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
        },
    );
}
