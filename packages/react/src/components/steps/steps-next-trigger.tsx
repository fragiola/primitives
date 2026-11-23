import {
    type StepsStepTriggerProps,
    useStepsStepTrigger,
} from "./steps-step-trigger.tsx";

export type StepsNextTriggerProps = StepsStepTriggerProps;

/**
 * The step after, past the last the completed state (spec/steps.md): disabled once completed, and
 * in a linear process while the current step is not valid.
 */
export function StepsNextTrigger(props: StepsNextTriggerProps) {
    return useStepsStepTrigger("next", "Steps.NextTrigger", props);
}
