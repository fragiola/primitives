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
import { ComboboxKey } from "./combobox-context.ts";

export interface ComboboxPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const ComboboxPortal: PublicComponent<
    ComboboxPortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "ComboboxPortal",
        props: overlayPortalProps,
        setup(props, { slots }) {
            const context = useRequiredContext(ComboboxKey, "Combobox.Portal");
            return useOverlayPortal(context.presence.mounted, props, slots);
        },
    }),
);
