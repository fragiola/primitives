import {
    type ChangeEvent,
    type FocusEvent,
    type KeyboardEvent,
    useCallback,
    useEffect,
    useRef,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    NumberFieldContext,
    type NumberFieldState,
    numberFieldState,
} from "./number-field-context.ts";

export type NumberFieldInputProps = PartProps<NumberFieldState>;

/** The `spinbutton`: a text input with the formatted value (spec/number-field.md, the APG). */
export function NumberFieldInput(props: NumberFieldInputProps) {
    const context = useRequiredContext(NumberFieldContext, "NumberField.Input");
    const {
        value,
        min,
        max,
        disabled,
        readOnly,
        required,
        field,
        setInputElement,
        allowWheelScrub,
    } = context;
    const latest = useRef(context);
    latest.current = context;
    const element = useRef<HTMLInputElement | null>(null);
    const ref = useCallback(
        (node: HTMLElement | null) => {
            element.current = node as HTMLInputElement | null;
            setInputElement(node as HTMLInputElement | null);
        },
        [setInputElement],
    );

    // the wheel over the focused Input steps it, and the page does not scroll (a non-passive
    // listener, which React's `onWheel` cannot be)
    useEffect(() => {
        const input = element.current;
        if (input === null || !allowWheelScrub) {
            return undefined;
        }
        const onWheel = (event: WheelEvent) => {
            if (
                input.ownerDocument.activeElement !== input ||
                event.deltaY === 0
            ) {
                return;
            }
            const current = latest.current;
            if (current.disabled || current.readOnly) {
                return;
            }
            event.preventDefault();
            const amount = current.amount(event);
            current.stepBy(event.deltaY < 0 ? amount : -amount, "wheel", event);
        };
        input.addEventListener("wheel", onWheel, { passive: false });
        return () => input.removeEventListener("wheel", onWheel);
    }, [allowWheelScrub]);

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const current = latest.current;
        if (current.disabled || current.readOnly) {
            return;
        }
        const native = event.nativeEvent;
        const amount = current.amount(native);
        switch (event.key) {
            case "ArrowUp":
                current.stepBy(amount, "keyboard", native);
                break;
            case "ArrowDown":
                current.stepBy(-amount, "keyboard", native);
                break;
            case "PageUp":
                current.stepBy(
                    current.amount({ shiftKey: true }),
                    "keyboard",
                    native,
                );
                break;
            case "PageDown":
                current.stepBy(
                    -current.amount({ shiftKey: true }),
                    "keyboard",
                    native,
                );
                break;
            case "Home":
                if (current.min === undefined) {
                    return;
                }
                current.stepTo(current.min, "keyboard", native);
                break;
            case "End":
                if (current.max === undefined) {
                    return;
                }
                current.stepTo(current.max, "keyboard", native);
                break;
            default:
                return;
        }
        event.preventDefault();
    };

    const integer =
        context.format?.maximumFractionDigits === 0 &&
        min !== undefined &&
        min >= 0;
    return renderElement(
        "input",
        props,
        numberFieldState(context),
        {
            id: context.inputId,
            type: "text",
            role: "spinbutton",
            inputMode: integer ? "numeric" : "decimal",
            autoComplete: "off",
            autoCorrect: "off",
            spellCheck: "false",
            value: context.inputValue,
            disabled,
            readOnly,
            "aria-valuenow": value ?? undefined,
            "aria-valuemin": min,
            "aria-valuemax": max,
            "aria-valuetext":
                value === null ? undefined : context.formattedValue,
            "aria-required": required ? "true" : undefined,
            "aria-readonly": readOnly ? "true" : undefined,
            ...field.aria,
            "data-primitives-part": "number-field-input",
            ...context.attributes,
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
                latest.current.onInputText(
                    event.currentTarget.value,
                    event.nativeEvent,
                );
            },
            onKeyDown,
            onFocus: field.onFocus,
            onBlur: (event: FocusEvent<HTMLInputElement>) => {
                latest.current.onInputBlur(event.nativeEvent);
                field.onBlur();
            },
        },
        ref,
    );
}
