import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { useOverlayPortal } from "../../utils/overlay-portal.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { NavigationMenuKey } from "./navigation-menu-context.ts";

export interface NavigationMenuPortalProps {
    /** Where the content goes (default: `body`). */
    container?: Element | string | null;
}

/** Moves the Backdrop and the Positioner to the end of `body` while a Content is open. */
export const NavigationMenuPortal: PublicComponent<
    NavigationMenuPortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "NavigationMenuPortal",
        props: {
            container: {
                type: [Object, String] as PropType<Element | string | null>,
                default: undefined,
            },
        },
        setup(props, { slots }) {
            const context = useRequiredContext(
                NavigationMenuKey,
                "NavigationMenu.Portal",
            );
            return useOverlayPortal(context.presence.mounted, props, slots);
        },
    }),
);
