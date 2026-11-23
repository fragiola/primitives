import { useRequiredContext } from "../../hooks/use-required-context.ts";
import {
    StepsContext,
    type StepsContextValue,
    StepsItemContext,
    type StepsItemState,
    stepsItemState,
} from "./steps-context.ts";

/** The Root's context and the enclosing Item's state, for a part inside an Item. */
export function useStepsItem(part: string): {
    context: StepsContextValue;
    state: StepsItemState;
} {
    const context = useRequiredContext(StepsContext, part);
    const index = useRequiredContext(StepsItemContext, part);
    return { context, state: stepsItemState(context, index) };
}
