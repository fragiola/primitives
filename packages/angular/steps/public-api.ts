// The entry of @fragiola/primitives-angular/steps: a process in a fixed number of steps, an ordered
// list with `aria-current="step"`, the current step's content, Previous and Next, and linear
// validation (spec/steps.md, the APG-closest semantics decided there), as standalone attribute
// directives on the consumer's own elements.

export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { StepsCompletedContent } from "./directives/steps-completed-content.directive.ts";
export { StepsContent } from "./directives/steps-content.directive.ts";
export { StepsIndicator } from "./directives/steps-indicator.directive.ts";
export { StepsItem } from "./directives/steps-item.directive.ts";
export { StepsList } from "./directives/steps-list.directive.ts";
export { StepsNextTrigger } from "./directives/steps-next-trigger.directive.ts";
export { StepsPrevTrigger } from "./directives/steps-prev-trigger.directive.ts";
export {
    type StepsItemState,
    StepsRoot,
    type StepsState,
} from "./directives/steps-root.directive.ts";
export { StepsSeparator } from "./directives/steps-separator.directive.ts";
export { StepsTrigger } from "./directives/steps-trigger.directive.ts";
export type { StepsStepTriggerState } from "./utils/steps-step-trigger.ts";
