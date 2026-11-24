import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { CascadeSelectContext } from "./cascade-select-context.ts";

export interface CascadeSelectPortalProps extends OverlayPortalProps {}

export function CascadeSelectPortal(props: CascadeSelectPortalProps) {
    const context = useRequiredContext(
        CascadeSelectContext,
        "CascadeSelect.Portal",
    );
    return useOverlayPortal(context.presence.mounted, props);
}
