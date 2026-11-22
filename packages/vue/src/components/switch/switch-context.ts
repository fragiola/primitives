import type { ComputedRef, InjectionKey } from "vue";

export interface SwitchState {
    checked: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export const SwitchKey: InjectionKey<ComputedRef<SwitchState>> =
    Symbol("Switch");

/** `data-checked` / `data-unchecked` (exactly one), and the switch's flags (spec/switch.md). */
export function switchAttributes(state: SwitchState) {
    return {
        checked: state.checked,
        unchecked: !state.checked,
        disabled: state.disabled,
        readonly: state.readOnly,
        required: state.required,
    };
}
