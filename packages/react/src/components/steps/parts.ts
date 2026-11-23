import { StepsCompletedContent } from "./steps-completed-content.tsx";
import { StepsContent } from "./steps-content.tsx";
import { StepsIndicator } from "./steps-indicator.tsx";
import { StepsItem } from "./steps-item.tsx";
import { StepsList } from "./steps-list.tsx";
import { StepsNextTrigger } from "./steps-next-trigger.tsx";
import { StepsPrevTrigger } from "./steps-prev-trigger.tsx";
import { StepsRoot } from "./steps-root.tsx";
import { StepsSeparator } from "./steps-separator.tsx";
import { StepsTrigger } from "./steps-trigger.tsx";

/** spec/steps.md */
export const Steps = {
    Root: StepsRoot,
    List: StepsList,
    Item: StepsItem,
    Trigger: StepsTrigger,
    Indicator: StepsIndicator,
    Separator: StepsSeparator,
    Content: StepsContent,
    PrevTrigger: StepsPrevTrigger,
    NextTrigger: StepsNextTrigger,
    CompletedContent: StepsCompletedContent,
};
