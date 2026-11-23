import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { AutocompleteContext } from "./autocomplete-context.ts";

export interface AutocompletePortalProps extends OverlayPortalProps {}

export function AutocompletePortal(props: AutocompletePortalProps) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.Portal",
    );
    return useOverlayPortal(context.presence.mounted, props);
}
