import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { renderPortal } from "../../utils/render-portal.ts";
import { DatePickerKey } from "./date-picker-context.ts";

export interface DatePickerPortalProps {
    /** Where the content goes (default: `body`). */
    container?: Element | string | null;
}

/** Moves the positioner to `container` (default: the body) while the popup is mounted. */
export const DatePickerPortal: PublicComponent<
    DatePickerPortalProps,
    ContentSlots
> = publicComponent(
    defineComponent({
        name: "DatePickerPortal",
        props: {
            container: {
                type: [Object, String] as PropType<Element | string | null>,
                default: undefined,
            },
        },
        setup(props, { slots }) {
            const context = useRequiredContext(
                DatePickerKey,
                "DatePicker.Portal",
            );
            return () =>
                renderPortal(context.presence.mounted, props.container, () =>
                    slots.default?.(),
                );
        },
    }),
);
