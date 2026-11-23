import { defineComponent, type PropType, ref } from "vue";
import { useOverlayPortal } from "../../utils/overlay-portal.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";

export interface ToastPortalProps {
    /** Where the Viewport goes (default: `body`). */
    container?: Element | string | null;
}

/** Renders the Viewport into `container` (default `body`), in the browser only (spec/toast.md). */
export const ToastPortal: PublicComponent<ToastPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "ToastPortal",
            props: {
                container: {
                    type: [Object, String] as PropType<Element | string | null>,
                    default: undefined,
                },
            },
            setup(props, { slots }) {
                return useOverlayPortal(ref(true), props, slots);
            },
        }),
    );
