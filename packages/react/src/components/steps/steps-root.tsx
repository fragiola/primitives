import { useId, useMemo } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { StepsContext, type StepsState } from "./steps-context.ts";

export interface StepsRootProps extends PartProps<StepsState> {
    /** The current step, from 0; `count` is the completed state (controlled). */
    step?: number;
    /** The step at first (default `0`). */
    defaultStep?: number;
    /** Every step change, with its reason. */
    onStepChange?: (step: number, details: ChangeDetails) => void;
    /** The number of steps. */
    count: number;
    /** A step can only be reached once every step before it is valid. */
    linear?: boolean;
    /** Whether a step is valid (default: every step), read at each render. */
    isStepValid?: (index: number) => boolean;
    orientation?: "horizontal" | "vertical";
}

const ALWAYS_VALID = () => true;

/** A process in a fixed number of steps (spec/steps.md): it holds the step and the validation. */
export function StepsRoot({
    step: stepProp,
    defaultStep = 0,
    onStepChange,
    count: countProp,
    linear = false,
    isStepValid = ALWAYS_VALID,
    orientation = "horizontal",
    ...props
}: StepsRootProps) {
    const count = Math.max(0, Math.floor(countProp));
    const [own, setOwn] = useControllableState(
        stepProp,
        defaultStep,
        onStepChange,
    );
    const step = Math.min(count, Math.max(0, Math.floor(own)));
    const completed = step === count;
    const baseId = useId();
    const context = useMemo(
        () => ({
            step,
            count,
            completed,
            orientation,
            linear,
            isStepValid,
            baseId,
            setStep: (next: number, details: ChangeDetails) => {
                const target = Math.min(count, Math.max(0, next));
                if (target !== step) {
                    setOwn(target, details);
                }
            },
        }),
        [
            step,
            count,
            completed,
            orientation,
            linear,
            isStepValid,
            baseId,
            setOwn,
        ],
    );
    const state: StepsState = { step, count, completed, orientation };
    return (
        <StepsContext.Provider value={context}>
            {renderElement("div", props, state, {
                "data-primitives-part": "steps-root",
                ...stateAttributes({ orientation, completed }),
            })}
        </StepsContext.Provider>
    );
}
