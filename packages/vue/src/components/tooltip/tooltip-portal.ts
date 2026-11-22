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
import { TooltipKey } from "./tooltip-context.ts";

export interface TooltipPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const TooltipPortal: PublicComponent<TooltipPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "TooltipPortal",
            props: overlayPortalProps,
            setup(props, { slots }) {
                const context = useRequiredContext(
                    TooltipKey,
                    "Tooltip.Portal",
                );
                return useOverlayPortal(context.presence.mounted, props, slots);
            },
        }),
    );
