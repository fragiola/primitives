import { watchAutoRepeat } from "@fragiola/primitives/number";
import { shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { NumberFieldContext } from "./number-field-context.ts";

/**
 * An Increment's or a Decrement's press and hold (spec/number-field.md, "Pointer"), and whether
 * it is disabled: the field disabled or read-only, or its step would change nothing.
 */
export function useStepperButton(
    context: NumberFieldContext,
    direction: 1 | -1,
) {
    const element = shallowRef<HTMLElement | null>(null);
    watch(
        element,
        (button, _, onCleanup) => {
            if (button === null) {
                return;
            }
            onCleanup(
                watchAutoRepeat(button, {
                    onStep: (event) =>
                        context.stepBy(
                            direction * context.amount(event as MouseEvent),
                            direction > 0
                                ? "increment-press"
                                : "decrement-press",
                            event,
                        ),
                }),
            );
        },
        { flush: "post" },
    );
    return {
        ref: elementSetter(element),
        disabled: () => {
            const { value, disabled, readOnly } = context.state.value;
            const min = context.min();
            const max = context.max();
            const atBound =
                value !== null &&
                (direction > 0
                    ? max !== undefined && value >= max
                    : min !== undefined && value <= min);
            return disabled || readOnly || atBound;
        },
    };
}
