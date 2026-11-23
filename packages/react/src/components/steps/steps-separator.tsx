import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { StepsItemState } from "./steps-context.ts";
import { useStepsItem } from "./use-steps-item.ts";

export type StepsSeparatorProps = PartProps<StepsItemState>;

/** The line from its step to the next (spec/steps.md), hidden from assistive technology. */
export function StepsSeparator(props: StepsSeparatorProps) {
    const { state } = useStepsItem("Steps.Separator");
    return renderElement("div", props, state, {
        "aria-hidden": "true",
        "data-primitives-part": "steps-separator",
        ...stateAttributes({
            current: state.current,
            completed: state.completed,
            incomplete: state.incomplete,
            orientation: state.orientation,
        }),
    });
}
