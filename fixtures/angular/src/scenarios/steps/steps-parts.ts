import {
    StepsCompletedContent,
    StepsContent,
    StepsIndicator,
    StepsItem,
    StepsList,
    StepsNextTrigger,
    StepsPrevTrigger,
    StepsRoot,
    StepsSeparator,
    StepsTrigger,
} from "@fragiola/primitives-angular/steps";

/** Every Steps directive, for a scenario's `imports`. */
export const STEPS_PARTS = [
    StepsRoot,
    StepsList,
    StepsItem,
    StepsTrigger,
    StepsIndicator,
    StepsSeparator,
    StepsContent,
    StepsCompletedContent,
    StepsPrevTrigger,
    StepsNextTrigger,
];
