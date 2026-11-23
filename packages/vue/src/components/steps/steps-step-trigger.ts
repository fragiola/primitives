import type { SetupContext, VNode } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { type AsProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { StepsKey } from "./steps-context.ts";

/** What a PrevTrigger or a NextTrigger renders with. */
export interface StepsStepTriggerState {
    /** The step it moves to. */
    step: number;
    disabled: boolean;
}

/**
 * The setup of a PrevTrigger or a NextTrigger (spec/steps.md): disabled where it cannot move.
 * Each part declares its own component with it.
 */
export function setupStepsStepTrigger(
    kind: "prev" | "next",
    name: string,
    props: { as?: AsProp | undefined },
    { attrs, slots }: Pick<SetupContext, "attrs" | "slots">,
): () => VNode {
    const context = useRequiredContext(StepsKey, name);
    return () => {
        const { step, count } = context.state();
        const target = kind === "prev" ? step - 1 : step + 1;
        const disabled =
            kind === "prev"
                ? step <= 0
                : step >= count ||
                  (context.linear() && !context.isStepValid(step));
        return renderPart(
            "button",
            { attrs, slots },
            props.as,
            { step: Math.min(count, Math.max(0, target)), disabled },
            {
                type: "button",
                disabled: disabled || undefined,
                onClick: (event: MouseEvent) => {
                    if (disabled) {
                        return;
                    }
                    context.setStep(target, {
                        reason:
                            kind === "prev" ? "previous-press" : "next-press",
                        event,
                    });
                },
                "data-primitives-part": `steps-${kind}-trigger`,
                ...stateAttributes({ disabled }),
            },
        );
    };
}
