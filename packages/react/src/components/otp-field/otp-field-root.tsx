import { inDocumentOrder } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    normalizeOtp,
    type OtpValidationType,
    otpInputMode,
    otpPattern,
    removeOtpCharacter,
    replaceOtp,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    type ChangeEvent,
    type KeyboardEvent,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    OTPFieldContext,
    type OTPFieldContextValue,
    type OTPFieldState,
} from "./otp-field-context.ts";

export interface OTPFieldRootProps extends PartProps<OTPFieldState> {
    /** The number of slots. */
    length: number;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string, details: ChangeDetails) => void;
    /** The value became `length` long, or a complete code was pasted again. */
    onValueComplete?: (value: string, details: ChangeDetails) => void;
    /** Typed or pasted text held characters `validationType` refuses. */
    onValueInvalid?: (text: string, details: ChangeDetails) => void;
    /** The characters a slot accepts (default `"numeric"`). */
    validationType?: OtpValidationType;
    /** The slots hide their characters (`type="password"`). */
    mask?: boolean;
    /** The first slot's and the hidden input's `autocomplete` (default `"one-time-code"`). */
    autoComplete?: string;
    /** The slots' virtual keyboard (default from `validationType`). */
    inputMode?: string;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    name?: string;
    /** The first slot's `id`; slot `n` gets `<id>-<n>`. */
    id?: string;
}

const NOOP = () => {};

/**
 * Holds an OTP field's code, its slots and its hidden form input (spec/otp-field.md: one native
 * input per slot, in a `group` with one tab stop).
 */
export function OTPFieldRoot({
    length,
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onValueComplete,
    onValueInvalid,
    validationType = "numeric",
    mask = false,
    autoComplete = "one-time-code",
    inputMode,
    required = false,
    readOnly = false,
    disabled: disabledProp = false,
    name,
    id: idProp,
    children,
    ...props
}: OTPFieldRootProps) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const direction = useContext(DirectionContext);
    const [raw, setOwnValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const value = normalizeOtp(raw, length, validationType).value;
    const [slots, setSlots] = useState<readonly HTMLInputElement[]>([]);
    const ordered = useMemo(
        () => inDocumentOrder(slots, (slot) => slot),
        [slots],
    );
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const hidden = useRef<HTMLInputElement>(null);
    const last = Math.max(length - 1, 0);
    const activeIndex = focusedIndex ?? Math.min(value.length, last);
    const field = useFieldControl({
        id,
        labelable: true,
        value,
        filled: value !== "",
        input: () => hidden.current,
        focusTarget: () => ordered[Math.min(value.length, last)] ?? null,
    });
    const disabled = disabledProp || field.disabled;
    const complete = value.length === length && length > 0;

    // the value as of the last change: a focus right after it reads it before the render
    const current = useRef(value);
    current.current = value;
    const latest = useRef({
        length,
        validationType,
        disabled,
        readOnly,
        defaultValue,
        ordered,
        direction,
        root,
        value,
        setOwnValue,
        onValueComplete,
        onValueInvalid,
        reset: field.reset,
    });
    latest.current = {
        length,
        validationType,
        disabled,
        readOnly,
        defaultValue,
        ordered,
        direction,
        root,
        value,
        setOwnValue,
        onValueComplete,
        onValueInvalid,
        reset: field.reset,
    };

    const register = useCallback((element: HTMLInputElement) => {
        setSlots((list) => [...list, element]);
        return () =>
            setSlots((list) => list.filter((slot) => slot !== element));
    }, []);

    const actions = useMemo(() => {
        const setValue = (
            next: string,
            reason: ChangeReason,
            event: Event | undefined,
        ) => {
            const state = latest.current;
            const details = { reason, event };
            if (next === current.current) {
                // a complete code pasted again completes again (Base UI)
                if (reason === "input-paste" && next.length === state.length) {
                    state.onValueComplete?.(next, details);
                }
                return;
            }
            current.current = next;
            state.setOwnValue(next, details);
            if (next.length === state.length) {
                state.onValueComplete?.(next, details);
            }
        };
        const focusSlot = (index: number) => {
            const { ordered: list, length: size } = latest.current;
            const target = Math.max(
                0,
                Math.min(index, current.current.length, size - 1),
            );
            const slot = list[target];
            if (slot !== undefined) {
                slot.focus();
                slot.select();
            }
        };
        const commit = (
            index: number,
            text: string,
            reason: "input-change" | "input-paste",
            event: Event,
        ) => {
            const state = latest.current;
            if (state.disabled || state.readOnly) {
                return;
            }
            const normalized = normalizeOtp(
                text,
                state.length,
                state.validationType,
            );
            if (normalized.rejected) {
                state.onValueInvalid?.(text, { reason, event });
            }
            if (normalized.value === "") {
                if (reason === "input-change" && text === "") {
                    setValue(
                        removeOtpCharacter(current.current, index),
                        "input-clear",
                        event,
                    );
                }
                return;
            }
            const next = replaceOtp(
                current.current,
                index,
                normalized.value,
                state.length,
                state.validationType,
            );
            setValue(next, reason, event);
            focusSlot(index + Array.from(normalized.value).length);
        };
        return { setValue, focusSlot, commit };
    }, []);

    const onSlotKeyDown = useCallback(
        (index: number, event: KeyboardEvent<HTMLInputElement>) => {
            const state = latest.current;
            if (event.defaultPrevented || state.disabled) {
                return;
            }
            const native = event.nativeEvent;
            const end = Math.min(current.current.length, state.length - 1);
            const boundary = (event.ctrlKey || event.metaKey) && !event.altKey;
            const rtl =
                getDirection(event.currentTarget, state.direction) === "rtl";
            const previousKey = rtl ? "ArrowRight" : "ArrowLeft";
            const nextKey = rtl ? "ArrowLeft" : "ArrowRight";
            const move = (target: number) => {
                event.preventDefault();
                actions.focusSlot(target);
            };
            if (event.key === previousKey) {
                move(boundary ? 0 : Math.max(0, index - 1));
                return;
            }
            if (event.key === nextKey) {
                move(boundary ? end : Math.min(state.length - 1, index + 1));
                return;
            }
            if (event.key === "Home" || event.key === "ArrowUp") {
                move(0);
                return;
            }
            if (event.key === "End" || event.key === "ArrowDown") {
                move(end);
                return;
            }
            if (state.readOnly) {
                return;
            }
            const character = Array.from(current.current)[index] ?? "";
            if (event.key === "Backspace" && boundary) {
                event.preventDefault();
                actions.setValue("", "keyboard", native);
                actions.focusSlot(0);
                return;
            }
            if (event.key === "Delete") {
                event.preventDefault();
                actions.setValue(
                    removeOtpCharacter(current.current, index),
                    "keyboard",
                    native,
                );
                actions.focusSlot(index);
                return;
            }
            if (event.key === "Backspace") {
                event.preventDefault();
                const target = Math.max(0, index - 1);
                actions.setValue(
                    removeOtpCharacter(
                        current.current,
                        character === "" ? target : index,
                    ),
                    "keyboard",
                    native,
                );
                actions.focusSlot(target);
                return;
            }
            const input = event.currentTarget;
            const selectsAll =
                input.selectionStart === 0 &&
                input.selectionEnd === input.value.length;
            if (
                event.key.length === 1 &&
                !boundary &&
                selectsAll &&
                character === event.key
            ) {
                // the character it already holds: only move on
                event.preventDefault();
                if (index < state.length - 1) {
                    actions.focusSlot(index + 1);
                }
            }
        },
        [actions],
    );

    const onSlotFocus = useCallback(
        (index: number, element: HTMLInputElement) => {
            if (index > current.current.length) {
                // no gap: the first empty slot takes the focus
                actions.focusSlot(current.current.length);
                return;
            }
            setFocusedIndex(index);
            element.select();
            field.onFocus();
        },
        [actions, field],
    );
    const onSlotBlur = useCallback(
        (related: EventTarget | null) => {
            const { root: element } = latest.current;
            if (related instanceof Node && element?.contains(related)) {
                return;
            }
            setFocusedIndex(null);
            field.onBlur();
        },
        [field],
    );

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
                actions.setValue(
                    normalizeOtp(
                        state.defaultValue,
                        state.length,
                        state.validationType,
                    ).value,
                    "none",
                    undefined,
                );
                element.value = state.value;
            },
            invalid: () => {
                const { ordered: list, length: size } = latest.current;
                return list[Math.min(current.current.length, size - 1)] ?? null;
            },
        });
    }, [actions]);

    const state: OTPFieldState = {
        value,
        length,
        complete,
        disabled,
        readOnly,
        required,
    };
    const attributes = {
        ...stateAttributes({
            disabled,
            readonly: readOnly,
            required,
            complete,
        }),
        ...field.attributes,
    };
    const context: OTPFieldContextValue = {
        ...state,
        field,
        id,
        mask,
        autoComplete,
        inputMode: inputMode ?? otpInputMode(validationType),
        activeIndex,
        attributes,
        register,
        indexOf: (element) =>
            element === null ? -1 : ordered.indexOf(element),
        onSlotText: (index, text, event) =>
            actions.commit(index, text, "input-change", event),
        onSlotPaste: (index, text, event) =>
            actions.commit(index, text, "input-paste", event),
        onSlotKeyDown,
        onSlotFocus,
        onSlotBlur,
        focusSlot: actions.focusSlot,
    };
    const formName = field.name ?? name;
    return (
        <OTPFieldContext.Provider value={context}>
            {renderElement(
                "div",
                { ...props, children },
                state,
                {
                    role: "group",
                    "aria-labelledby": field.aria["aria-labelledby"],
                    "aria-describedby": field.aria["aria-describedby"],
                    "data-primitives-part": "otp-field-root",
                    ...attributes,
                },
                setRoot,
            )}
            <input
                ref={hidden}
                type="text"
                aria-hidden="true"
                tabIndex={-1}
                name={formName}
                value={value}
                autoComplete={autoComplete}
                maxLength={length}
                pattern={otpPattern(validationType, length)}
                required={required}
                disabled={disabled}
                onFocus={() => actions.focusSlot(0)}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    // the browser's autofill of the hidden input
                    const { value: next } = normalizeOtp(
                        event.currentTarget.value,
                        length,
                        validationType,
                    );
                    if (!disabled && !readOnly) {
                        actions.setValue(
                            next,
                            "input-change",
                            event.nativeEvent,
                        );
                    }
                }}
                onInvalid={NOOP}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part="otp-field-hidden-input"
            />
        </OTPFieldContext.Provider>
    );
}
