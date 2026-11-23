import {
    type ChangeEvent,
    type ClipboardEvent,
    type FocusEvent,
    type KeyboardEvent,
    type MouseEvent,
    useCallback,
    useLayoutEffect,
    useState,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    OTPFieldContext,
    type OTPFieldInputState,
} from "./otp-field-context.ts";

export type OTPFieldInputProps = PartProps<OTPFieldInputState>;

/**
 * One slot of the code: a native input holding one character (spec/otp-field.md). Its name is
 * the consumer's, which says its position.
 */
export function OTPFieldInput(props: OTPFieldInputProps) {
    const context = useRequiredContext(OTPFieldContext, "OTPField.Input");
    const [element, setElement] = useState<HTMLInputElement | null>(null);
    const ref = useCallback(
        (node: HTMLElement | null) =>
            setElement(node as HTMLInputElement | null),
        [],
    );
    const { register } = context;
    useLayoutEffect(
        () => (element === null ? undefined : register(element)),
        [element, register],
    );
    const index = context.indexOf(element);
    const known = index >= 0;
    const character = known ? (Array.from(context.value)[index] ?? "") : "";
    const state: OTPFieldInputState = {
        value: context.value,
        length: context.length,
        complete: context.complete,
        disabled: context.disabled,
        readOnly: context.readOnly,
        required: context.required,
        index,
        character,
        filled: character !== "",
    };
    const named =
        props["aria-label"] !== undefined ||
        props["aria-labelledby"] !== undefined;
    const { field } = context;
    return renderElement(
        "input",
        props,
        state,
        {
            id: known
                ? index === 0
                    ? context.id
                    : `${context.id}-${index + 1}`
                : undefined,
            type: context.mask ? "password" : "text",
            inputMode: context.inputMode,
            autoComplete: index === 0 ? context.autoComplete : "off",
            autoCorrect: "off",
            spellCheck: "false",
            enterKeyHint: index === context.length - 1 ? "done" : "next",
            maxLength: index === 0 ? context.length : undefined,
            tabIndex: known && index === context.activeIndex ? 0 : -1,
            value: character,
            disabled: context.disabled,
            readOnly: context.readOnly,
            "aria-labelledby": named
                ? undefined
                : field.aria["aria-labelledby"],
            "aria-invalid": field.aria["aria-invalid"],
            "data-primitives-part": "otp-field-input",
            ...context.attributes,
            ...stateAttributes({
                filled: character !== "",
                index: known ? String(index) : undefined,
            }),
            onMouseDown: (event: MouseEvent<HTMLInputElement>) => {
                if (event.button !== 0 || context.disabled || !known) {
                    return;
                }
                // focused without a caret inside its character: it is selected
                event.preventDefault();
                context.focusSlot(index);
            },
            onFocus: (event: FocusEvent<HTMLInputElement>) => {
                if (known) {
                    context.onSlotFocus(index, event.currentTarget);
                }
            },
            onBlur: (event: FocusEvent<HTMLInputElement>) =>
                context.onSlotBlur(event.relatedTarget),
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                if (known) {
                    context.onSlotText(
                        index,
                        event.currentTarget.value,
                        event.nativeEvent,
                    );
                }
            },
            onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
                if (!known || context.disabled || context.readOnly) {
                    return;
                }
                event.preventDefault();
                context.onSlotPaste(
                    index,
                    event.clipboardData.getData("text/plain"),
                    event.nativeEvent,
                );
            },
            onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
                if (known) {
                    context.onSlotKeyDown(index, event);
                }
            },
        },
        ref,
    );
}
