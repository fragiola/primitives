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
import { CascadeSelectKey } from "./cascade-select-context.ts";

export interface CascadeSelectPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const CascadeSelectPortal: PublicComponent<
    CascadeSelectPortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "CascadeSelectPortal",
        props: overlayPortalProps,
        setup(props, { slots }) {
            const context = useRequiredContext(
                CascadeSelectKey,
                "CascadeSelect.Portal",
            );
            return useOverlayPortal(context.presence.mounted, props, slots);
        },
    }),
);
