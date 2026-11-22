import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    type KeyboardEvent,
    type MouseEvent,
    useEffect,
    useLayoutEffect,
    useRef,
} from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { RadioGroupContext } from "../radio-group/radio-group-context.ts";
import {
    RadioContext,
    type RadioState,
    radioAttributes,
} from "./radio-context.ts";

export interface RadioRootProps extends PartProps<RadioState> {
    /** Its value in the group. */
    value: string;
    disabled?: boolean;
    id?: string;
}

const NOOP = () => {};

/** A `radio` of a RadioGroup, with its hidden form input (spec/radio-group.md). */
export function RadioRoot({
    value,
    disabled: disabledProp = false,
    children,
    ...props
}: RadioRootProps) {
    const group = useRequiredContext(RadioGroupContext, "Radio.Root");
    const [button, buttonRef] = useElement<HTMLElement>();
    const input = useRef<HTMLInputElement>(null);
    const disabled = disabledProp || group.disabled;
    const checked = group.value === value;
    const { register } = group;
    useLayoutEffect(
        () =>
            button === null
                ? undefined
                : register({ value, disabled, element: button }),
        [register, value, disabled, button],
    );

    const latest = useRef(group);
    latest.current = group;
    useEffect(() => {
        const element = input.current;
        if (element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            // every radio of the group reports the reset; the group returns to its default once
            reset: () => {
                latest.current.reset();
            },
            invalid: () => latest.current.tabStopElement(),
        });
    }, []);

    const state = { checked, disabled, required: group.required };
    // the roving tab stop: before the radios registered (on a server), the checked one
    const holdsTabStop = group.tabStop === value && !disabled;
    return (
        <RadioContext.Provider value={state}>
            {renderElement(
                "button",
                { ...props, children },
                state,
                {
                    type: "button",
                    role: "radio",
                    disabled,
                    "aria-checked": checked ? "true" : "false",
                    tabIndex: holdsTabStop ? 0 : -1,
                    "data-primitives-part": "radio-root",
                    ...stateAttributes({
                        ...radioAttributes(state),
                        required: group.required,
                    }),
                    onClick: (event: MouseEvent<HTMLElement>) => {
                        if (disabled) {
                            return;
                        }
                        // a press on its label checks and focuses it
                        event.currentTarget.focus();
                        group.select(value);
                    },
                    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
                        // a native radio does not check on Enter (a button would click)
                        if (event.key === "Enter") {
                            event.preventDefault();
                            return;
                        }
                        if (group.navigate(event.key, event.currentTarget)) {
                            event.preventDefault();
                        }
                    },
                },
                buttonRef,
            )}
            <input
                ref={input}
                type="radio"
                aria-hidden="true"
                tabIndex={-1}
                name={group.name}
                value={value}
                checked={checked}
                required={group.required}
                disabled={disabled}
                onChange={NOOP}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part="radio-input"
            />
        </RadioContext.Provider>
    );
}
