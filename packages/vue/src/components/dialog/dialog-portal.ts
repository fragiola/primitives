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
import { DialogKey } from "./dialog-context.ts";

export interface DialogPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const DialogPortal: PublicComponent<DialogPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "DialogPortal",
            props: overlayPortalProps,
            setup(props, { slots }) {
                const context = useRequiredContext(DialogKey, "Dialog.Portal");
                return useOverlayPortal(context.presence.mounted, props, slots);
            },
        }),
    );
