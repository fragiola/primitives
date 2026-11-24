import type { Color } from "@fragiola/primitives/color";
import { type ComputedRef, computed, inject } from "vue";
import type { ChangeDetails } from "../utils/change-details.ts";
import {
    type ColorPickerBinding,
    ColorPickerBindingKey,
} from "../utils/color-picker-binding.ts";

export interface ColorPickerBindingState<T> {
    /** The enclosing ColorPicker's binding, or `null` outside one. */
    picker: ColorPickerBinding | null;
    /** The binding while the control is bound to it (it has neither `value` nor `defaultValue`). */
    bound: () => ColorPickerBinding | null;
    /** The control's value: the picker's while bound, else its own. */
    value: ComputedRef<T>;
    /**
     * Sets the value: its own, or, while bound, reports it (`report`, the control's own emits)
     * and sets the picker's.
     */
    set: (next: T, details: ChangeDetails) => void;
}

/**
 * The ColorPicker a color control is inside (spec/color-picker.md, "Sharing the color"): it is
 * bound to it unless it was given its own `value` or `defaultValue` (`own`); `state` is the
 * control's own controllable value and `report` its change emits.
 */
export function useColorPickerBinding<T>(
    own: () => boolean,
    state: {
        value: ComputedRef<T>;
        set: (next: T, details: ChangeDetails) => void;
    },
    report: (next: T, details: ChangeDetails) => void,
): ColorPickerBindingState<T> {
    const picker = inject(ColorPickerBindingKey, null);
    const bound = () => (own() ? null : picker);
    return {
        picker,
        bound,
        value: computed(() => {
            const binding = bound();
            return binding === null
                ? state.value.value
                : (binding.value() as T);
        }),
        set: (next, details) => {
            const binding = bound();
            if (binding === null) {
                state.set(next, details);
                return;
            }
            report(next, details);
            binding.setValue(next as unknown as Color, details);
        },
    };
}
