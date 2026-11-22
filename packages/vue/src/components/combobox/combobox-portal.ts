import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { renderPortal } from "../../utils/render-portal.ts";
import { ComboboxKey } from "./combobox-context.ts";

export interface ComboboxPortalProps {
    /** Where the content goes (default: `body`). */
    container?: Element | string | null;
}

export const ComboboxPortal: PublicComponent<
    ComboboxPortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "ComboboxPortal",
        props: {
            container: {
                type: [Object, String] as PropType<Element | string | null>,
                default: undefined,
            },
        },
        setup(props, { slots }) {
            const context = useRequiredContext(ComboboxKey, "Combobox.Portal");
            return () =>
                renderPortal(context.presence.mounted, props.container, () =>
                    slots.default?.(),
                );
        },
    }),
);
