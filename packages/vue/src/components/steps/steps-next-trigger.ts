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

/** The step after, past the last the completed state (spec/steps.md): disabled once completed, and in a linear process while the current step is not valid. */
export const StepsNextTrigger: PartComponent<
    Record<never, never>,
    StepsStepTriggerState
> = publicComponent(
    defineComponent({
        name: "StepsNextTrigger",
        inheritAttrs: false,
        props: asProp,
        setup: (props, context) =>
            setupStepsStepTrigger("next", "Steps.NextTrigger", props, context),
    }),
);
