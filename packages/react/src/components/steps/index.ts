// The entry of @fragiola/primitives-react/steps: a process in a fixed number of steps, an ordered
// list with `aria-current="step"`, the current step's content, Previous and Next, and linear
// validation (spec/steps.md, the APG-closest semantics decided there).

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Steps } from "./parts.ts";
export type { StepsCompletedContentProps } from "./steps-completed-content.tsx";
export type { StepsContentProps } from "./steps-content.tsx";
export type { StepsItemState, StepsState } from "./steps-context.ts";
export type { StepsIndicatorProps } from "./steps-indicator.tsx";
export type { StepsItemProps } from "./steps-item.tsx";
export type { StepsListProps } from "./steps-list.tsx";
export type { StepsNextTriggerProps } from "./steps-next-trigger.tsx";
export type { StepsPrevTriggerProps } from "./steps-prev-trigger.tsx";
export type { StepsRootProps } from "./steps-root.tsx";
export type { StepsSeparatorProps } from "./steps-separator.tsx";
export type {
    StepsStepTriggerProps,
    StepsStepTriggerState,
} from "./steps-step-trigger.tsx";
export type { StepsTriggerProps } from "./steps-trigger.tsx";
