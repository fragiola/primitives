import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { MenuContext } from "./menu-context.ts";

export interface MenuPortalProps extends OverlayPortalProps {}

export function MenuPortal(props: MenuPortalProps) {
    const context = useRequiredContext(MenuContext, "Menu.Portal");
    return useOverlayPortal(context.presence.mounted, props);
}
