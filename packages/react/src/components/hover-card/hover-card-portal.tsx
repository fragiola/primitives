import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { HoverCardContext } from "./hover-card-context.ts";

export interface HoverCardPortalProps extends OverlayPortalProps {}

export function HoverCardPortal(props: HoverCardPortalProps) {
    const context = useRequiredContext(HoverCardContext, "HoverCard.Portal");
    return useOverlayPortal(context.presence.mounted, props);
}
