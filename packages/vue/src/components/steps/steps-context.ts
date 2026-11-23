import type { InjectionKey } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";

/** What the Root renders with (spec/steps.md). */
export interface StepsState {
    /** The current step, from 0; `count` once completed. */
    step: number;
    count: number;
    /** Every step is done. */
    completed: boolean;
    orientation: "horizontal" | "vertical";
}

export interface StepsContext {
    state: () => StepsState;
    linear: () => boolean;
    isStepValid: (index: number) => boolean;
    baseId: string;
    setStep: (step: number, details: ChangeDetails) => void;
}

export const StepsKey: InjectionKey<StepsContext> = Symbol("Steps");

/** The Item a Trigger, an Indicator or a Separator sits in: its index. */
export const StepsItemKey: InjectionKey<() => number> = Symbol("StepsItem");

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
export function stepReachable(context: StepsContext, index: number): boolean {
    if (index <= context.state().step || !context.linear()) {
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
    context: StepsContext,
    index: number,
): StepsItemState {
    const { step, orientation } = context.state();
    return {
        index,
        current: index === step,
        completed: index < step,
        incomplete: index > step,
        disabled: !stepReachable(context, index),
        orientation,
    };
}

/** A step's `data-*` attributes (spec/steps.md, "State attributes and ARIA"). */
export function itemAttributes(state: StepsItemState): Record<string, string> {
    return stateAttributes({
        current: state.current,
        completed: state.completed,
        incomplete: state.incomplete,
        disabled: state.disabled,
        orientation: state.orientation,
    });
}

export const stepsContentId = (baseId: string, index: number) =>
    `${baseId}-content-${index}`;
