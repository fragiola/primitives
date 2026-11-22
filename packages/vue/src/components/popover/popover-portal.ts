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
import { PopoverKey } from "./popover-context.ts";

export interface PopoverPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const PopoverPortal: PublicComponent<PopoverPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "PopoverPortal",
            props: overlayPortalProps,
            setup(props, { slots }) {
                const context = useRequiredContext(
                    PopoverKey,
                    "Popover.Portal",
                );
                return useOverlayPortal(context.presence.mounted, props, slots);
            },
        }),
    );
