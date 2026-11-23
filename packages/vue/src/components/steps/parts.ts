import { StepsCompletedContent } from "./steps-completed-content.ts";
import { StepsContent } from "./steps-content.ts";
import { StepsIndicator } from "./steps-indicator.ts";
import { StepsItem } from "./steps-item.ts";
import { StepsList } from "./steps-list.ts";
import { StepsNextTrigger } from "./steps-next-trigger.ts";
import { StepsPrevTrigger } from "./steps-prev-trigger.ts";
import { StepsRoot } from "./steps-root.ts";
import { StepsSeparator } from "./steps-separator.ts";
import { StepsTrigger } from "./steps-trigger.ts";

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
