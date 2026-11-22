import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { TooltipContext } from "./tooltip-context.ts";

export interface TooltipPortalProps extends OverlayPortalProps {}

export function TooltipPortal(props: TooltipPortalProps) {
    const context = useRequiredContext(TooltipContext, "Tooltip.Portal");
    return useOverlayPortal(context.presence.mounted, props);
}
