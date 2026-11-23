import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type StepsContext,
    StepsItemKey,
    type StepsItemState,
    StepsKey,
    stepsItemState,
} from "./steps-context.ts";

/** The Root's context and the enclosing Item's state, for a part inside an Item. */
export function useStepsItem(part: string): {
    context: StepsContext;
    state: () => StepsItemState;
} {
    const context = useRequiredContext(StepsKey, part);
    const index = useRequiredContext(StepsItemKey, part);
    return { context, state: () => stepsItemState(context, index()) };
}
