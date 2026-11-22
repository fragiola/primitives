import { computed, defineComponent, provide } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionItemKey,
    type AccordionItemState,
    AccordionKey,
    itemAttributes,
    panelId,
    triggerId,
} from "./accordion-context.ts";

export interface AccordionItemProps {
    value: string;
    disabled?: boolean;
}

/** One section: its header and its panel (spec/accordion.md). */
export const AccordionItem: PartComponent<
    AccordionItemProps,
    AccordionItemState
> = publicComponent(
    defineComponent({
        name: "AccordionItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, required: true },
            disabled: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const root = useRequiredContext(AccordionKey, "Accordion.Item");
            const state = computed<AccordionItemState>(() => ({
                open: root.value.value.includes(props.value),
                disabled: root.disabled() || props.disabled,
                orientation: root.orientation(),
            }));
            provide(AccordionItemKey, {
                state,
                triggerId: () => triggerId(root.baseId, props.value),
                panelId: () => panelId(root.baseId, props.value),
                setOpen: (open, reason) =>
                    root.toggle(props.value, open, reason),
            });
            return () => {
                const current = state.value;
                return renderPart("div", { attrs, slots }, props.as, current, {
                    "data-primitives-part": "accordion-item",
                    ...stateAttributes({
                        ...itemAttributes(current),
                        orientation: current.orientation,
                    }),
                });
            };
        },
    }),
);
