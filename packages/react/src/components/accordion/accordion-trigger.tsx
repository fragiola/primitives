import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionItemContext,
    type AccordionItemState,
} from "./accordion-context.ts";

export type AccordionTriggerProps = PartProps<AccordionItemState>;

/** A header's button (spec/accordion.md): Enter and Space through its native click. */
export function AccordionTrigger(props: AccordionTriggerProps) {
    const item = useRequiredContext(AccordionItemContext, "Accordion.Trigger");
    const { open, disabled } = item;
    return renderElement(
        "button",
        props,
        { open, disabled, orientation: item.orientation },
        {
            type: "button",
            id: item.triggerId,
            "aria-expanded": open ? "true" : "false",
            "aria-controls": open ? item.panelId : undefined,
            disabled: disabled || undefined,
            "data-primitives-part": "accordion-trigger",
            ...stateAttributes({ disabled, "panel-open": open }),
            onClick: () => {
                if (!disabled) {
                    item.setOpen(!open, "trigger-press");
                }
            },
        },
    );
}
