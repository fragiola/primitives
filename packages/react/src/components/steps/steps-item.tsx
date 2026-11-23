import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    StepsContext,
    StepsItemContext,
    type StepsItemState,
    stepsItemState,
} from "./steps-context.ts";

export interface StepsItemProps extends PartProps<StepsItemState> {
    /** Its step, from 0. */
    index: number;
}

/** One step (spec/steps.md): `aria-current="step"` while it is the current one. */
export function StepsItem({ index, ...props }: StepsItemProps) {
    const context = useRequiredContext(StepsContext, "Steps.Item");
    const state = stepsItemState(context, index);
    return (
        <StepsItemContext.Provider value={index}>
            {renderElement("li", props, state, {
                "aria-current": state.current ? "step" : undefined,
                "data-primitives-part": "steps-item",
                ...itemAttributes(state),
            })}
        </StepsItemContext.Provider>
    );
}

/** A step's `data-*` attributes (spec/steps.md, "State attributes and ARIA"). */
export function itemAttributes(
    state: StepsItemState,
): Record<`data-${string}`, string> {
    return stateAttributes({
        current: state.current,
        completed: state.completed,
        incomplete: state.incomplete,
        disabled: state.disabled,
        orientation: state.orientation,
    });
}
