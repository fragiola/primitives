import { createContext } from "react";

export interface RadioState {
    checked: boolean;
    disabled: boolean;
    required: boolean;
}

export const RadioContext = createContext<RadioState | null>(null);

/** `data-checked` / `data-unchecked` (exactly one), `data-disabled` (spec/radio-group.md). */
export function radioAttributes(state: RadioState) {
    return {
        checked: state.checked,
        unchecked: !state.checked,
        disabled: state.disabled,
    };
}
