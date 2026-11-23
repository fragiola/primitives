import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type OverlayPortalProps,
    overlayPortalProps,
    useOverlayPortal,
} from "../../utils/overlay-portal.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { AutocompleteKey } from "./autocomplete-context.ts";

export interface AutocompletePortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const AutocompletePortal: PublicComponent<
    AutocompletePortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "AutocompletePortal",
        props: overlayPortalProps,
        setup(props, { slots }) {
            const context = useRequiredContext(
                AutocompleteKey,
                "Autocomplete.Portal",
            );
            return useOverlayPortal(context.presence.mounted, props, slots);
        },
    }),
);
