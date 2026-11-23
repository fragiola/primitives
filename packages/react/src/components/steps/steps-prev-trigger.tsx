import {
    type StepsStepTriggerProps,
    useStepsStepTrigger,
} from "./steps-step-trigger.tsx";

export type StepsPrevTriggerProps = StepsStepTriggerProps;

/** The step before (spec/steps.md): disabled on the first step. */
export function StepsPrevTrigger(props: StepsPrevTriggerProps) {
    return useStepsStepTrigger("prev", "Steps.PrevTrigger", props);
}
