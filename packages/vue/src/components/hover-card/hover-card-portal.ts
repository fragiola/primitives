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
import { HoverCardKey } from "./hover-card-context.ts";

export interface HoverCardPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const HoverCardPortal: PublicComponent<
    HoverCardPortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "HoverCardPortal",
        props: overlayPortalProps,
        setup(props, { slots }) {
            const context = useRequiredContext(
                HoverCardKey,
                "HoverCard.Portal",
            );
            return useOverlayPortal(context.presence.mounted, props, slots);
        },
    }),
);
