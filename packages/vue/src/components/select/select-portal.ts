import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { renderPortal } from "../../utils/render-portal.ts";
import { SelectKey } from "./select-context.ts";

export interface SelectPortalProps {
    /** Where the content goes (default: `body`). */
    container?: Element | string | null;
}

export const SelectPortal: PublicComponent<SelectPortalProps, ContentSlots> =
    publicComponent(
        defineComponent({
            name: "SelectPortal",
            props: {
                container: {
                    type: [Object, String] as PropType<Element | string | null>,
                    default: undefined,
                },
            },
            setup(props, { slots }) {
                const context = useRequiredContext(SelectKey, "Select.Portal");
                return () =>
                    renderPortal(
                        context.presence.mounted,
                        props.container,
                        () => slots.default?.(),
                    );
            },
        }),
    );
