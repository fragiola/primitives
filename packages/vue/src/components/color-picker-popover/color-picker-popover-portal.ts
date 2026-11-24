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
import { ColorPickerPopoverKey } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const ColorPickerPopoverPortal: PublicComponent<
    ColorPickerPopoverPortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "ColorPickerPopoverPortal",
        props: overlayPortalProps,
        setup(props, { slots }) {
            const context = useRequiredContext(
                ColorPickerPopoverKey,
                "ColorPickerPopover.Portal",
            );
            return useOverlayPortal(context.presence.mounted, props, slots);
        },
    }),
);
