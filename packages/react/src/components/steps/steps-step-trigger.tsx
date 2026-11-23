import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { StepsContext } from "./steps-context.ts";

/** What a PrevTrigger or a NextTrigger renders with. */
export interface StepsStepTriggerState {
    /** The step it moves to. */
    step: number;
    disabled: boolean;
}

export interface StepsStepTriggerProps
    extends PartProps<StepsStepTriggerState> {
    onClick?: MouseEventHandler<HTMLElement>;
}

/** A PrevTrigger or a NextTrigger (spec/steps.md): disabled where it cannot move. */
export function useStepsStepTrigger(
    kind: "prev" | "next",
    name: string,
    { onClick, ...props }: StepsStepTriggerProps,
): ReactNode {
    const context = useRequiredContext(StepsContext, name);
    const target = kind === "prev" ? context.step - 1 : context.step + 1;
    const disabled =
        kind === "prev"
            ? context.step <= 0
            : context.step >= context.count ||
              (context.linear && !context.isStepValid(context.step));
    return renderElement(
        "button",
        props,
        { step: Math.min(context.count, Math.max(0, target)), disabled },
        {
            type: "button",
            disabled: disabled || undefined,
            onClick: (event: MouseEvent<HTMLElement>) => {
                if (disabled) {
                    return;
                }
                context.setStep(target, {
                    reason: kind === "prev" ? "previous-press" : "next-press",
                    event: event.nativeEvent,
                });
                onClick?.(event);
            },
            "data-primitives-part": `steps-${kind}-trigger`,
            ...stateAttributes({ disabled }),
        },
    );
}
