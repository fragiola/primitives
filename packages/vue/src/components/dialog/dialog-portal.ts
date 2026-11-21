import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { renderPortal } from "../../utils/render-portal.ts";
import { DialogKey } from "./dialog-context.ts";

/** Moves the backdrop and the popup to the end of `body` while the dialog is open or closing. */
export interface DialogPortalProps {
    /** Where the content goes (default: `body`). */
    container?: Element | string | null;
}

export const DialogPortal: PublicComponent<DialogPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "DialogPortal",
            props: {
                container: {
                    type: [Object, String] as PropType<Element | string | null>,
                    default: undefined,
                },
            },
            setup(props, { slots }) {
                const context = useRequiredContext(DialogKey, "Dialog.Portal");
                return () =>
                    renderPortal(
                        context.presence.mounted,
                        props.container,
                        () => slots.default?.(),
                    );
            },
        }),
    );
