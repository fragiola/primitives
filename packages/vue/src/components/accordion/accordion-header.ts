import { defineComponent } from "vue";
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
    itemAttributes,
} from "./accordion-context.ts";

/** The heading around a Trigger, an `h3` (spec/accordion.md). */
export const AccordionHeader: PartComponent<
    Record<never, never>,
    AccordionItemState
> = publicComponent(
    defineComponent({
        name: "AccordionHeader",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const item = useRequiredContext(
                AccordionItemKey,
                "Accordion.Header",
            );
            return () => {
                const state = item.state.value;
                return renderPart("h3", { attrs, slots }, props.as, state, {
                    "data-primitives-part": "accordion-header",
                    ...stateAttributes(itemAttributes(state)),
                });
            };
        },
    }),
);
