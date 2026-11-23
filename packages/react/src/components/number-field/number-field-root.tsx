import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    clampNumber,
    formatNumber,
    isNumberText,
    parseNumber,
    type ScrubPoint,
    stepNumber,
} from "@fragiola/primitives/number";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NumberFieldContext,
    type NumberFieldContextValue,
    type NumberFieldState,
} from "./number-field-context.ts";

export interface NumberFieldRootProps extends PartProps<NumberFieldState> {
    /** A number, or `null` while empty. */
    value?: number | null;
    defaultValue?: number | null;
    onValueChange?: (value: number | null, details: ChangeDetails) => void;
    min?: number;
    max?: number;
    /** The amount of a step (default `1`). */
    step?: number;
    /** The amount of a step with Alt (default `0.1`). */
    smallStep?: number;
    /** The amount of a step with Shift, Page Up and Page Down (default `10`). */
    largeStep?: number;
    /** A step from a value off the grid goes to the grid's next point. */
    snapOnStep?: boolean;
    /** A typed value outside `[min, max]` is clamped on blur (default `true`). */
    clampOnBlur?: boolean;
    /** How the Input writes the value; default: the plain number in the locale. */
    format?: Intl.NumberFormatOptions;
    /** The locale of the format and the parsing (BCP 47; default: the runtime's). */
    locale?: string;
    /** The mouse wheel steps the value over the focused Input. */
    allowWheelScrub?: boolean;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    name?: string;
    /** The Input's `id`. */
    id?: string;
}

const NOOP = () => {};

/**
 * Holds a NumberField's value, its text and its hidden form input (spec/number-field.md, the APG
 * spinbutton).
 */
export function NumberFieldRoot({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    smallStep = 0.1,
    largeStep = 10,
    snapOnStep = false,
    clampOnBlur = true,
    format,
    locale,
    allowWheelScrub = false,
    required = false,
    readOnly = false,
    disabled: disabledProp = false,
    name,
    id: idProp,
    children,
    ...props
}: NumberFieldRootProps) {
    const generatedId = useId();
    const inputId = idProp ?? generatedId;
    const [value, setOwnValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    // the text the user typed, until the blur formats it (`null`: the formatted value)
    const [typed, setTyped] = useState<string | null>(null);
    const [scrubbing, setScrubbing] = useState(false);
    const [cursor, setCursor] = useState<ScrubPoint | null>(null);
    const [input, setInputElement] = useState<HTMLInputElement | null>(null);
    const hidden = useRef<HTMLInputElement>(null);
    const field = useFieldControl({
        id: inputId,
        labelable: true,
        value,
        filled: value !== null,
        input: () => hidden.current,
        focusTarget: () => input,
    });
    const disabled = disabledProp || field.disabled;
    const formattedValue = formatNumber(value, { locale, format });
    const inputValue = typed ?? formattedValue;

    // the value as of the last change, so a held button's steps never read a stale render
    const current = useRef(value);
    current.current = value;
    const latest = useRef({
        value,
        typed,
        min,
        max,
        step,
        smallStep,
        largeStep,
        snapOnStep,
        clampOnBlur,
        format,
        locale,
        disabled,
        readOnly,
        defaultValue,
        setOwnValue,
        reset: field.reset,
    });
    latest.current = {
        value,
        typed,
        min,
        max,
        step,
        smallStep,
        largeStep,
        snapOnStep,
        clampOnBlur,
        format,
        locale,
        disabled,
        readOnly,
        defaultValue,
        setOwnValue,
        reset: field.reset,
    };

    const actions = useMemo(() => {
        const setValue = (next: number | null, details: ChangeDetails) => {
            current.current = next;
            latest.current.setOwnValue(next, details);
            // an override for the steps of this task only: a consumer that refused the value
            // renders nothing, and the next task steps from the value it kept
            setTimeout(() => {
                current.current = latest.current.value;
            });
        };
        /** The value a step starts from: the typed text when it reads as a number. */
        const base = (): number | null => {
            const {
                typed: text,
                locale: lang,
                format: options,
            } = latest.current;
            if (text === null) {
                return current.current;
            }
            const parsed = parseNumber(text, { locale: lang, format: options });
            return parsed === null || Number.isNaN(parsed)
                ? current.current
                : parsed;
        };
        return {
            setValue,
            amount: (
                event: { altKey?: boolean; shiftKey?: boolean } | undefined,
            ) => {
                const {
                    step: one,
                    smallStep: small,
                    largeStep: large,
                } = latest.current;
                return event?.altKey ? small : event?.shiftKey ? large : one;
            },
            stepBy: (
                amount: number,
                reason: ChangeReason,
                event: Event | undefined,
                times = 1,
            ) => {
                const state = latest.current;
                if (state.disabled || state.readOnly) {
                    return false;
                }
                let next = base();
                for (let index = 0; index < times; index += 1) {
                    next = stepNumber(next, amount, {
                        min: state.min,
                        max: state.max,
                        snapOnStep: state.snapOnStep,
                    });
                }
                setTyped(null);
                if (!Object.is(next, current.current)) {
                    setValue(next, { reason, event });
                }
                const bound = amount > 0 ? state.max : state.min;
                return bound === undefined || next !== bound;
            },
            stepTo: (
                next: number,
                reason: ChangeReason,
                event: Event | undefined,
            ) => {
                const state = latest.current;
                if (state.disabled || state.readOnly) {
                    return;
                }
                setTyped(null);
                if (!Object.is(next, current.current)) {
                    setValue(next, { reason, event });
                }
            },
            onInputText: (text: string, event: Event) => {
                const state = latest.current;
                if (state.disabled || state.readOnly) {
                    return false;
                }
                const options = { locale: state.locale, format: state.format };
                if (!isNumberText(text, options)) {
                    // refused: the text stays as it was (spec/number-field.md, "Typing")
                    return false;
                }
                setTyped(text);
                if (text.trim() === "") {
                    setValue(null, { reason: "input-clear", event });
                    return true;
                }
                const parsed = parseNumber(text, options);
                if (parsed !== null && !Number.isNaN(parsed)) {
                    setValue(parsed, { reason: "input-change", event });
                }
                return true;
            },
            onInputBlur: (event: Event) => {
                const state = latest.current;
                if (state.typed === null) {
                    return;
                }
                let next = base();
                if (state.clampOnBlur && next !== null) {
                    next = clampNumber(next, state.min, state.max);
                }
                setTyped(null);
                if (!Object.is(next, current.current)) {
                    setValue(next, { reason: "input-blur", event });
                }
            },
        };
    }, []);

    // a form reset returns it to its default, and writes the rendered value back (Switch's way)
    useEffect(() => {
        const element = hidden.current;
        if (element === null) {
            return undefined;
        }
        return bridgeForm(element, {
            reset: () => {
                const state = latest.current;
                state.reset();
                setTyped(null);
                actions.setValue(state.defaultValue, { reason: "none" });
                // the rendered value, which a render that changes it patches again (a controlled
                // field that refuses the reset keeps its input)
                element.value = state.value === null ? "" : String(state.value);
            },
            invalid: () => input,
        });
    }, [input, actions]);

    const state: NumberFieldState = {
        value,
        inputValue,
        disabled,
        readOnly,
        required,
        scrubbing,
    };
    const attributes = {
        ...stateAttributes({
            disabled,
            readonly: readOnly,
            required,
            scrubbing,
        }),
        ...field.attributes,
    };
    const context: NumberFieldContextValue = {
        ...state,
        inputId,
        min,
        max,
        locale,
        format,
        formattedValue,
        allowWheelScrub,
        field,
        attributes,
        amount: actions.amount,
        stepBy: actions.stepBy,
        stepTo: actions.stepTo,
        onInputText: actions.onInputText,
        onInputBlur: actions.onInputBlur,
        setInputElement,
        setScrubbing,
        cursor,
        setCursor,
    };
    const formName = field.name ?? name;
    return (
        <NumberFieldContext.Provider value={context}>
            {renderElement("div", { ...props, children }, state, {
                "data-primitives-part": "number-field-root",
                ...attributes,
            })}
            <input
                ref={hidden}
                type="number"
                aria-hidden="true"
                tabIndex={-1}
                name={formName}
                value={value === null ? "" : String(value)}
                min={min}
                max={max}
                step="any"
                required={required}
                disabled={disabled}
                onChange={NOOP}
                onFocus={() => input?.focus()}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part="number-field-hidden-input"
            />
        </NumberFieldContext.Provider>
    );
}
