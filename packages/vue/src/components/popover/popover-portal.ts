import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { renderPortal } from "../../utils/render-portal.ts";
import { PopoverKey } from "./popover-context.ts";

export interface PopoverPortalProps {
    /** Where the content goes (default: `body`). */
    container?: Element | string | null;
}

export const PopoverPortal: PublicComponent<PopoverPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "PopoverPortal",
            props: {
                container: {
                    type: [Object, String] as PropType<Element | string | null>,
                    default: undefined,
                },
            },
            setup(props, { slots }) {
                const context = useRequiredContext(
                    PopoverKey,
                    "Popover.Portal",
                );
                return () =>
                    renderPortal(
                        context.presence.mounted,
                        props.container,
                        () => slots.default?.(),
                    );
            },
        }),
    );
