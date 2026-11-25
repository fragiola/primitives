import { watchAutoRepeat } from "@fragiola/primitives/number";
import { useEffect, useRef, useState } from "react";
import type { NumberFieldContextValue } from "./number-field-context.ts";

/**
 * An Increment's or a Decrement's press and hold (spec/number-field.md, "Pointer"), and whether
 * it is disabled: the field disabled or read-only, or its step would change nothing.
 */
export function useStepperButton(
    context: NumberFieldContextValue,
    direction: 1 | -1,
) {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const latest = useRef(context);
    latest.current = context;
    useEffect(() => {
        if (element === null) {
            return undefined;
        }
        return watchAutoRepeat(element, {
            onStep: (event) => {
                const current = latest.current;
                const amount = current.amount(event as MouseEvent);
                return current.stepBy(
                    direction * amount,
                    direction > 0 ? "increment-press" : "decrement-press",
                    event,
                );
            },
            onEnd: (event) => latest.current.commit(event),
        });
    }, [element, direction]);
    const { value, min, max } = context;
    const atBound =
        value !== null &&
        (direction > 0
            ? max !== undefined && value >= max
            : min !== undefined && value <= min);
    return {
        ref: setElement,
        disabled: context.disabled || context.readOnly || atBound,
    };
}
