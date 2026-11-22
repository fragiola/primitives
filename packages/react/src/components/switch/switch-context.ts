import { createContext } from "react";

export interface SwitchState {
    checked: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export const SwitchContext = createContext<SwitchState | null>(null);

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
