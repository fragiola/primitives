import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { renderPortal } from "../../utils/render-portal.ts";
import { TooltipKey } from "./tooltip-context.ts";

export interface TooltipPortalProps {
    /** Where the content goes (default: `body`). */
    container?: Element | string | null;
}

export const TooltipPortal: PublicComponent<TooltipPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "TooltipPortal",
            props: {
                container: {
                    type: [Object, String] as PropType<Element | string | null>,
                    default: undefined,
                },
            },
            setup(props, { slots }) {
                const context = useRequiredContext(
                    TooltipKey,
                    "Tooltip.Portal",
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
