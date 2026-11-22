import type { ComputedRef, InjectionKey } from "vue";

export interface RadioState {
    checked: boolean;
    disabled: boolean;
    required: boolean;
}

export const RadioKey: InjectionKey<ComputedRef<RadioState>> = Symbol("Radio");

/** `data-checked` / `data-unchecked` (exactly one), `data-disabled` (spec/radio-group.md). */
export function radioAttributes(state: RadioState) {
    return {
        checked: state.checked,
        unchecked: !state.checked,
        disabled: state.disabled,
    };
}
