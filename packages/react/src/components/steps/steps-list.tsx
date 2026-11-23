import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { StepsContext, type StepsState } from "./steps-context.ts";

export type StepsListProps = PartProps<StepsState>;

/** The steps, an ordered list (spec/steps.md); the app names it. */
export function StepsList(props: StepsListProps) {
    const context = useRequiredContext(StepsContext, "Steps.List");
    const { step, count, completed, orientation } = context;
    return renderElement(
        "ol",
        props,
        { step, count, completed, orientation },
        {
            "data-primitives-part": "steps-list",
            ...stateAttributes({ orientation }),
        },
    );
}
