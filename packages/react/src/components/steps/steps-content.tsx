import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    StepsContext,
    type StepsItemState,
    stepsContentId,
    stepsItemState,
} from "./steps-context.ts";

export interface StepsContentProps extends PartProps<StepsItemState> {
    /** Its step, from 0. */
    index: number;
}

/** The content of one step (spec/steps.md): `hidden` unless it is the current one. */
export function StepsContent({ index, ...props }: StepsContentProps) {
    const context = useRequiredContext(StepsContext, "Steps.Content");
    const state = stepsItemState(context, index);
    return renderElement("div", props, state, {
        id: stepsContentId(context.baseId, index),
        hidden: !state.current,
        "data-primitives-part": "steps-content",
        ...stateAttributes({ current: state.current }),
    });
}
