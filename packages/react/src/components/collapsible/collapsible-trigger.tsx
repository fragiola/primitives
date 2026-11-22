import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CollapsibleContext,
    type CollapsibleState,
} from "./collapsible-context.ts";

export type CollapsibleTriggerProps = PartProps<CollapsibleState>;

/** The disclosure button (spec/collapsible.md): Enter and Space through its native click. */
export function CollapsibleTrigger(props: CollapsibleTriggerProps) {
    const context = useRequiredContext(
        CollapsibleContext,
        "Collapsible.Trigger",
    );
    const { open, disabled } = context;
    return renderElement(
        "button",
        props,
        { open, disabled },
        {
            type: "button",
            "aria-expanded": open ? "true" : "false",
            "aria-controls": open ? context.panelId : undefined,
            disabled: disabled || undefined,
            "data-primitives-part": "collapsible-trigger",
            ...stateAttributes({ disabled, "panel-open": open }),
            onClick: () => {
                if (!disabled) {
                    context.setOpen(!open, "trigger-press");
                }
            },
        },
    );
}
