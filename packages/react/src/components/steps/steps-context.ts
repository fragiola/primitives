import { createContext } from "react";
import type { ChangeDetails } from "../../utils/change-details.ts";

/** What the Root renders with (spec/steps.md). */
export interface StepsState {
    /** The current step, from 0; `count` once completed. */
    step: number;
    count: number;
    /** Every step is done. */
    completed: boolean;
    orientation: "horizontal" | "vertical";
}

export interface StepsContextValue extends StepsState {
    linear: boolean;
    isStepValid: (index: number) => boolean;
    baseId: string;
    setStep: (step: number, details: ChangeDetails) => void;
}

export const StepsContext = createContext<StepsContextValue | null>(null);

/** The Item a Trigger, an Indicator or a Separator sits in. */
export const StepsItemContext = createContext<number | null>(null);

/** What a step's parts render with: its index and where it is from the current step. */
export interface StepsItemState {
    index: number;
    current: boolean;
    completed: boolean;
    incomplete: boolean;
    /** The step cannot be reached (spec/steps.md, "Which steps can be reached"). */
    disabled: boolean;
    orientation: "horizontal" | "vertical";
}

/** Whether a step can be reached from the current one (spec/steps.md). */
export function stepReachable(
    context: Pick<StepsContextValue, "step" | "linear" | "isStepValid">,
    index: number,
): boolean {
    if (index <= context.step || !context.linear) {
        return true;
    }
    for (let before = 0; before < index; before++) {
        if (!context.isStepValid(before)) {
            return false;
        }
    }
    return true;
}

export function stepsItemState(
    context: StepsContextValue,
    index: number,
): StepsItemState {
    return {
        index,
        current: index === context.step,
        completed: index < context.step,
        incomplete: index > context.step,
        disabled: !stepReachable(context, index),
        orientation: context.orientation,
    };
}

export const stepsContentId = (baseId: string, index: number) =>
    `${baseId}-content-${index}`;
