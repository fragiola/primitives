import {
    type ChangeEvent,
    type FocusEvent,
    type KeyboardEvent,
    useCallback,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    ColorFieldContext,
    type ColorFieldState,
    colorFieldState,
} from "./color-field-context.ts";

export type ColorFieldInputProps = PartProps<ColorFieldState>;

/**
 * The text: a textbox (hex), or a `spinbutton` with `channel` (spec/color-field.md); Enter and
 * blur commit it, the arrows step it.
 */
export function ColorFieldInput(props: ColorFieldInputProps) {
    const context = useRequiredContext(ColorFieldContext, "ColorField.Input");
    const { field, disabled, readOnly, required, setInputElement } = context;
    const ref = useCallback(
        (node: HTMLElement | null) =>
            setInputElement(node as HTMLInputElement | null),
        [setInputElement],
    );
    const channelMode = context.channel !== undefined;

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            context.commitText("keyboard", event.nativeEvent);
            return;
        }
        if (context.stepKey(event.key, event.shiftKey, event.nativeEvent)) {
            event.preventDefault();
        }
    };

    return renderElement(
        "input",
        props,
        colorFieldState(context),
        {
            id: context.inputId,
            type: "text",
            role: channelMode ? "spinbutton" : undefined,
            inputMode: channelMode ? "decimal" : undefined,
            autoComplete: "off",
            autoCorrect: "off",
            spellCheck: "false",
            value: context.inputValue,
            disabled,
            readOnly,
            "aria-valuenow": channelMode
                ? (context.channelValue ?? undefined)
                : undefined,
            "aria-valuemin": channelMode ? context.range?.min : undefined,
            "aria-valuemax": channelMode ? context.range?.max : undefined,
            "aria-valuetext":
                channelMode && context.value !== null
                    ? context.valueText
                    : undefined,
            "aria-required": required ? "true" : undefined,
            "aria-readonly": readOnly ? "true" : undefined,
            ...field.aria,
            "data-primitives-part": "color-field-input",
            ...context.attributes,
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
                context.onInputText(event.currentTarget.value),
            onKeyDown,
            onFocus: field.onFocus,
            onBlur: (event: FocusEvent<HTMLInputElement>) => {
                context.commitText("input-blur", event.nativeEvent);
                field.onBlur();
            },
        },
        ref,
    );
}
