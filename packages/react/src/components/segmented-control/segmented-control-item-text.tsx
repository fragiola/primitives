import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SegmentedControlItemContext,
    type SegmentedControlItemState,
} from "./segmented-control-context.ts";

/** An Item's text (spec/segmented-control.md), with its Item's state. */
export function SegmentedControlItemText(
    props: PartProps<SegmentedControlItemState>,
) {
    const state = useRequiredContext(
        SegmentedControlItemContext,
        "SegmentedControl.ItemText",
    );
    return renderElement("span", props, state, {
        "data-primitives-part": "segmented-control-item-text",
        ...stateAttributes({
            checked: state.checked,
            unchecked: !state.checked,
            disabled: state.disabled,
        }),
    });
}
