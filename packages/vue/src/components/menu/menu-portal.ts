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
import { MenuKey } from "./menu-context.ts";

export interface MenuPortalProps extends OverlayPortalProps {}

/** Moves the content to `container` (default: the body) while mounted, or always with `keep-mounted`. */
export const MenuPortal: PublicComponent<MenuPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "MenuPortal",
            props: overlayPortalProps,
            setup(props, { slots }) {
                const context = useRequiredContext(MenuKey, "Menu.Portal");
                return useOverlayPortal(context.presence.mounted, props, slots);
            },
        }),
    );
