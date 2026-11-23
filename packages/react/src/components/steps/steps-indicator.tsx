import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import type { StepsItemState } from "./steps-context.ts";
import { useStepsItem } from "./use-steps-item.ts";

export type StepsIndicatorProps = PartProps<StepsItemState>;

/** Its step's number or check mark (spec/steps.md), hidden from assistive technology. */
export function StepsIndicator(props: StepsIndicatorProps) {
    const { state } = useStepsItem("Steps.Indicator");
    return renderElement("span", props, state, {
        "aria-hidden": "true",
        "data-primitives-part": "steps-indicator",
        ...stateAttributes({
            current: state.current,
            completed: state.completed,
            incomplete: state.incomplete,
        }),
    });
}
