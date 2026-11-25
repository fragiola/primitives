import {
    afterNextRender,
    computed,
    DestroyRef,
    inject,
    type Signal,
} from "@angular/core";
import { watchAutoRepeat } from "@fragiola/primitives/number";
import { injectHost } from "@fragiola/primitives-angular/internal";
import type { NumberFieldRoot } from "../directives/number-field-root.directive.ts";

/**
 * An Increment's or a Decrement's press and hold (spec/number-field.md, "Pointer"), in its
 * directive's injection context, and whether it is disabled: the field disabled or read-only, or
 * its step would change nothing (the value at the bound it steps to). The press is watched in the
 * browser only, once rendered.
 */
export function stepperButton(
    root: NumberFieldRoot,
    direction: 1 | -1,
): { disabled: Signal<boolean> } {
    const host = injectHost();
    let stop: (() => void) | null = null;
    afterNextRender(() => {
        stop = watchAutoRepeat(host, {
            onStep: (event) =>
                root.stepBy(
                    direction * root.amount(event as MouseEvent),
                    direction > 0 ? "increment-press" : "decrement-press",
                    event,
                ),
            onEnd: (event) => root.commit(event),
        });
    });
    inject(DestroyRef).onDestroy(() => stop?.());
    return {
        disabled: computed(() => {
            const { value, disabled, readOnly } = root.state();
            const min = root.min();
            const max = root.max();
            const atBound =
                value !== null &&
                (direction > 0
                    ? max !== undefined && value >= max
                    : min !== undefined && value <= min);
            return disabled || readOnly || atBound;
        }),
    };
}
