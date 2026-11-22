import { useCallback, useMemo } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    AccordionContext,
    AccordionItemContext,
    type AccordionItemState,
    itemAttributes,
    panelId,
    triggerId,
} from "./accordion-context.ts";

export interface AccordionItemProps extends PartProps<AccordionItemState> {
    value: string;
    disabled?: boolean;
}

/** One section: its header and its panel (spec/accordion.md). */
export function AccordionItem({
    value,
    disabled: disabledProp = false,
    ...props
}: AccordionItemProps) {
    const root = useRequiredContext(AccordionContext, "Accordion.Item");
    const open = root.value.includes(value);
    const disabled = root.disabled || disabledProp;
    const { toggle, orientation, baseId } = root;
    const setOpen = useCallback(
        (next: boolean, reason: ChangeReason) => toggle(value, next, reason),
        [toggle, value],
    );
    const context = useMemo(
        () => ({
            value,
            open,
            disabled,
            orientation,
            triggerId: triggerId(baseId, value),
            panelId: panelId(baseId, value),
            setOpen,
        }),
        [value, open, disabled, orientation, baseId, setOpen],
    );
    const state = { open, disabled, orientation };
    return (
        <AccordionItemContext.Provider value={context}>
            {renderElement("div", props, state, {
                "data-primitives-part": "accordion-item",
                ...stateAttributes({ ...itemAttributes(state), orientation }),
            })}
        </AccordionItemContext.Provider>
    );
}
