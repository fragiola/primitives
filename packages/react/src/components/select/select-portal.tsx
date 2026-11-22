import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { SelectContext } from "./select-context.ts";

export interface SelectPortalProps extends OverlayPortalProps {}

export function SelectPortal(props: SelectPortalProps) {
    const context = useRequiredContext(SelectContext, "Select.Portal");
    return useOverlayPortal(context.presence.mounted, props);
}
