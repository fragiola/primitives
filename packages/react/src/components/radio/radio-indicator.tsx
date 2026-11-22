import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    RadioContext,
    type RadioState,
    radioAttributes,
} from "./radio-context.ts";

export interface RadioIndicatorProps extends PartProps<RadioState> {
    /** Rendered in every state, not only while checked. */
    keepMounted?: boolean;
}

/** The dot, hidden from assistive technologies (spec/radio-group.md). */
export function RadioIndicator({
    keepMounted = false,
    ...props
}: RadioIndicatorProps) {
    const state = useRequiredContext(RadioContext, "Radio.Indicator");
    if (!keepMounted && !state.checked) {
        return null;
    }
    return renderElement("span", props, state, {
        "aria-hidden": "true",
        "data-primitives-part": "radio-indicator",
        ...stateAttributes(radioAttributes(state)),
    });
}
