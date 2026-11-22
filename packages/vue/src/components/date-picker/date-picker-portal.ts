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
import { DatePickerKey } from "./date-picker-context.ts";

export interface DatePickerPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const DatePickerPortal: PublicComponent<
    DatePickerPortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "DatePickerPortal",
        props: overlayPortalProps,
        setup(props, { slots }) {
            const context = useRequiredContext(
                DatePickerKey,
                "DatePicker.Portal",
            );
            return useOverlayPortal(context.presence.mounted, props, slots);
        },
    }),
);
