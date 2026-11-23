import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { StepsContext, type StepsState } from "./steps-context.ts";

export type StepsCompletedContentProps = PartProps<StepsState>;

/** What shows once every step is done (spec/steps.md): `hidden` until then. */
export function StepsCompletedContent(props: StepsCompletedContentProps) {
    const context = useRequiredContext(StepsContext, "Steps.CompletedContent");
    const { step, count, completed, orientation } = context;
    return renderElement(
        "div",
        props,
        { step, count, completed, orientation },
        {
            hidden: !completed,
            "data-primitives-part": "steps-completed-content",
        },
    );
}
