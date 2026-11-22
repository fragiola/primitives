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
import { SelectKey } from "./select-context.ts";

export interface SelectPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const SelectPortal: PublicComponent<SelectPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "SelectPortal",
            props: overlayPortalProps,
            setup(props, { slots }) {
                const context = useRequiredContext(SelectKey, "Select.Portal");
                return useOverlayPortal(context.presence.mounted, props, slots);
            },
        }),
    );
