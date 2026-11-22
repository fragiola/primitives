import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { ComboboxContext } from "./combobox-context.ts";

export interface ComboboxPortalProps extends OverlayPortalProps {}

export function ComboboxPortal(props: ComboboxPortalProps) {
    const context = useRequiredContext(ComboboxContext, "Combobox.Portal");
    return useOverlayPortal(context.presence.mounted, props);
}
