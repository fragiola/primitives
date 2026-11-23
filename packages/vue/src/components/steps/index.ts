// The entry of @fragiola/primitives-vue/steps: a process in a fixed number of steps, an ordered
// list with `aria-current="step"`, the current step's content, Previous and Next, and linear
// validation (spec/steps.md, the APG-closest semantics decided there).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Steps } from "./parts.ts";
export type { StepsContentProps } from "./steps-content.ts";
export type { StepsItemState, StepsState } from "./steps-context.ts";
export type { StepsItemProps } from "./steps-item.ts";
export type { StepsRootEmits, StepsRootProps } from "./steps-root.ts";
export type { StepsStepTriggerState } from "./steps-step-trigger.ts";
