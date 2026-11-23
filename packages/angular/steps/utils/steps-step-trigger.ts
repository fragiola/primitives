import { computed, inject, type Signal } from "@angular/core";
import { StepsRoot } from "../directives/steps-root.directive.ts";

/** What a PrevTrigger or a NextTrigger renders with. */
export interface StepsStepTriggerState {
    /** The step it moves to. */
    step: number;
    disabled: boolean;
}

/**
 * The shared code of the PrevTrigger and the NextTrigger (spec/steps.md), in the directive's
 * injection context: its target step, disabled where it cannot move, and its press.
 */
export function stepsStepTrigger(kind: "prev" | "next"): {
    state: Signal<StepsStepTriggerState>;
    press: (event: Event) => void;
} {
    const root = inject(StepsRoot);
    const target = computed(() =>
        kind === "prev" ? root.currentStep() - 1 : root.currentStep() + 1,
    );
    const state = computed<StepsStepTriggerState>(() => {
        const step = root.currentStep();
        const count = root.stepCount();
        const disabled =
            kind === "prev"
                ? step <= 0
                : step >= count || (root.linear() && !root.isStepValid()(step));
        return { step: Math.min(count, Math.max(0, target())), disabled };
    });
    return {
        state,
        press: (event) => {
            if (state().disabled) {
                return;
            }
            root.setStep(target(), {
                reason: kind === "prev" ? "previous-press" : "next-press",
                event,
            });
        },
    };
}
