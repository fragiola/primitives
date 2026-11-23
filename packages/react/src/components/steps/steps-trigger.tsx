import type { MouseEvent, MouseEventHandler } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { type StepsItemState, stepsContentId } from "./steps-context.ts";
import { itemAttributes } from "./steps-item.tsx";
import { useStepsItem } from "./use-steps-item.ts";

export interface StepsTriggerProps extends PartProps<StepsItemState> {
    onClick?: MouseEventHandler<HTMLElement>;
}

/** Moves to its Item's step (spec/steps.md): disabled while that step cannot be reached. */
export function StepsTrigger({ onClick, ...props }: StepsTriggerProps) {
    const { context, state } = useStepsItem("Steps.Trigger");
    return renderElement("button", props, state, {
        type: "button",
        disabled: state.disabled || undefined,
        "aria-current": state.current ? "step" : undefined,
        "aria-controls": stepsContentId(context.baseId, state.index),
        onClick: (event: MouseEvent<HTMLElement>) => {
            if (state.disabled) {
                return;
            }
            context.setStep(state.index, {
                reason: "trigger-press",
                event: event.nativeEvent,
            });
            onClick?.(event);
        },
        "data-primitives-part": "steps-trigger",
        ...itemAttributes(state),
    });
}
