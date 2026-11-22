import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import { useEffect, useId, useRef } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SwitchContext,
    type SwitchState,
    switchAttributes,
} from "./switch-context.ts";

export interface SwitchRootProps extends PartProps<SwitchState> {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean, details: ChangeDetails) => void;
    disabled?: boolean;
    required?: boolean;
    /** Focusable and submitted, but a press or a key does not toggle it. */
    readOnly?: boolean;
    name?: string;
    /** Submitted while on (`"on"`). */
    value?: string;
    /** Submitted while off, when given (Base UI); nothing is submitted while off without it. */
    uncheckedValue?: string;
    id?: string;
}

const NOOP = () => {};

/** A `switch` with its hidden form inputs (spec/switch.md, the APG switch). */
export function SwitchRoot({
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    disabled: disabledProp = false,
    required = false,
    readOnly = false,
    name,
    value = "on",
    uncheckedValue,
    id: idProp,
    children,
    ...props
}: SwitchRootProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const [checked, setChecked] = useControllableState(
        checkedProp,
        defaultChecked,
        onCheckedChange,
    );
    const [button, buttonRef] = useElement<HTMLElement>();
    const input = useRef<HTMLInputElement>(null);
    const field = useFieldControl({
        id,
        labelable: true,
        value: checked,
        filled: checked,
        input: () => input.current,
        focusTarget: () => button,
    });
    const disabled = disabledProp || field.disabled;

    const latest = useRef({
        checked,
        defaultChecked,
        setChecked,
        reset: field.reset,
    });
    latest.current = {
        checked,
        defaultChecked,
        setChecked,
        reset: field.reset,
    };
    useEffect(() => {
        const element = input.current;
        if (element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                const current = latest.current;
                current.reset();
                current.setChecked(current.defaultChecked, { reason: "none" });
                // the rendered state, which a render that changes it patches again (a controlled
                // switch that refuses the reset keeps its input)
                element.checked = current.checked;
            },
            invalid: () => button,
        });
    }, [button]);

    const state = { checked, disabled, readOnly, required };
    const formName = field.name ?? name;
    return (
        <SwitchContext.Provider value={state}>
            {renderElement(
                "button",
                { ...props, children },
                state,
                {
                    type: "button",
                    role: "switch",
                    id,
                    disabled,
                    "aria-checked": checked ? "true" : "false",
                    "aria-required": required ? "true" : undefined,
                    "aria-readonly": readOnly ? "true" : undefined,
                    ...field.aria,
                    "data-primitives-part": "switch-root",
                    ...field.attributes,
                    ...stateAttributes(switchAttributes(state)),
                    // Space and Enter click a native button: both toggle (APG, Base UI)
                    onClick: () => {
                        if (!disabled && !readOnly) {
                            setChecked(!checked, { reason: "none" });
                        }
                    },
                    onFocus: field.onFocus,
                    onBlur: field.onBlur,
                },
                buttonRef,
            )}
            <input
                ref={input}
                type="checkbox"
                aria-hidden="true"
                tabIndex={-1}
                name={formName}
                value={value}
                checked={checked}
                required={required}
                disabled={disabled}
                onChange={NOOP}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part="switch-input"
            />
            {!checked && uncheckedValue !== undefined && (
                <input
                    type="hidden"
                    name={formName}
                    value={uncheckedValue}
                    disabled={disabled}
                    data-primitives-part="switch-unchecked-input"
                />
            )}
        </SwitchContext.Provider>
    );
}
