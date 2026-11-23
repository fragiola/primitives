import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp } from "../../utils/render-part.ts";
import {
    type StepsStepTriggerState,
    setupStepsStepTrigger,
} from "./steps-step-trigger.ts";

/** The step before (spec/steps.md): disabled on the first step. */
export const StepsPrevTrigger: PartComponent<
    Record<never, never>,
    StepsStepTriggerState
> = publicComponent(
    defineComponent({
        name: "StepsPrevTrigger",
        inheritAttrs: false,
        props: asProp,
        setup: (props, context) =>
            setupStepsStepTrigger("prev", "Steps.PrevTrigger", props, context),
    }),
);
