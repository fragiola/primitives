import type { ReactNode } from "react";
import { useOverlayPortal } from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { NavigationMenuContext } from "./navigation-menu-context.ts";

export interface NavigationMenuPortalProps {
    children?: ReactNode;
    /** Where the content goes (default: `document.body`). */
    container?: Element | null;
}

/** Moves the Backdrop and the Positioner to the end of `body` while a Content is open. */
export function NavigationMenuPortal(props: NavigationMenuPortalProps) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Portal",
    );
    return useOverlayPortal(context.presence.mounted, props);
}
