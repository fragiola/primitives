import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionItemContext,
    type AccordionItemState,
    itemAttributes,
} from "./accordion-context.ts";

export type AccordionHeaderProps = PartProps<AccordionItemState>;

/** The heading around a Trigger, an `h3` (spec/accordion.md). */
export function AccordionHeader(props: AccordionHeaderProps) {
    const item = useRequiredContext(AccordionItemContext, "Accordion.Header");
    const state = {
        open: item.open,
        disabled: item.disabled,
        orientation: item.orientation,
    };
    return renderElement("h3", props, state, {
        "data-primitives-part": "accordion-header",
        ...stateAttributes(itemAttributes(state)),
    });
}
