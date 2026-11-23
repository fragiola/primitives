import {
    type Color,
    type ColorChannel,
    type ColorSpace,
    clampColorChannel,
    colorChannelFormat,
    colorChannelRange,
    colorSpaceFor,
    convertColor,
    formatColor,
    formatColorChannel,
    getColorChannel,
    isSameColor,
    parseColor,
    setColorChannel,
} from "@fragiola/primitives/color";
import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import { parseNumber } from "@fragiola/primitives/number";
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
    ColorFieldContext,
    type ColorFieldContextValue,
    type ColorFieldState,
} from "./color-field-context.ts";

const NOOP = () => {};

/** A `Color`, a string `parseColor` reads (`null` when it reads none), or `null`. */
function toColor(
    value: Color | string | null | undefined,
): Color | null | undefined {
    if (value === undefined || value === null) {
        return value;
    }
    return parseColor(value);
}

/** Black in `space`: what a channel typed into an empty field is set on. */
function black(space: ColorSpace): Color {
    return convertColor(
        { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 },
        space,
    );
}

/** The 24-bit number of a color, plus `amount`, clamped, back to an rgb color. */
function stepHex(color: Color | null, amount: number): Color {
    const rgb = convertColor(color ?? black("rgb"), "rgb") as Extract<
        Color,
        { space: "rgb" }
    >;
    const number = Math.min(
        Math.max((rgb.red << 16) + (rgb.green << 8) + rgb.blue + amount, 0),
        0xffffff,
    );
    return {
        space: "rgb",
        red: (number >> 16) & 0xff,
        green: (number >> 8) & 0xff,
        blue: number & 0xff,
        alpha: rgb.alpha,
    };
}

function round2(value: number): number {
    return Math.round(value * 100) / 100 + 0;
}

export interface ColorFieldRootProps extends PartProps<ColorFieldState> {
    value?: Color | string | null;
    defaultValue?: Color | string | null;
    onValueChange?: (value: Color | null, details: ChangeDetails) => void;
    /** The channel the field edits (none: the whole color, as hex). */
    channel?: ColorChannel;
    /** With `channel`, the space it edits it in. */
    colorSpace?: ColorSpace;
    /** The locale of the channel's text (BCP 47; default: the runtime's). */
    locale?: string;
    name?: string;
    /** The Input's id (generated unless given). */
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
}

/**
 * Holds a ColorField's value, its typed text and its hidden form input (spec/color-field.md: a hex
 * textbox, or the APG spinbutton for one channel; the text commits on Enter and blur).
 */
export function ColorFieldRoot({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    channel,
    colorSpace,
    locale,
    name,
    id: idProp,
    disabled: disabledProp = false,
    readOnly = false,
    required = false,
    children,
    ...props
}: ColorFieldRootProps) {
    const generatedId = useId();
    const inputId = idProp ?? generatedId;
    const [current, setOwnValue] = useControllableState<
        Color | null,
        ChangeDetails
    >(toColor(valueProp), toColor(defaultValue) ?? null, onValueChange);
    const space =
        channel === undefined
            ? (current?.space ?? "rgb")
            : colorSpaceFor(channel, current ?? black("rgb"), colorSpace);
    const value =
        current === null || channel === undefined
            ? current
            : convertColor(current, space);
    const channelValue =
        value === null || channel === undefined
            ? null
            : getColorChannel(value, channel);
    // the text the user typed, until a commit (`null`: the value's text)
    const [typed, setTyped] = useState<string | null>(null);
    const [input, setInputElement] = useState<HTMLInputElement | null>(null);
    const hidden = useRef<HTMLInputElement>(null);
    const valueText =
        value === null
            ? ""
            : channel === undefined
              ? formatColor(value, "hex")
              : formatColorChannel(value, channel, locale);
    const formValue =
        value === null
            ? ""
            : channel === undefined
              ? formatColor(value, "hex")
              : String(channelValue);
    const field = useFieldControl({
        id: inputId,
        labelable: true,
        value: formValue === "" ? null : formValue,
        filled: value !== null,
        input: () => hidden.current,
        focusTarget: () => input,
    });
    const disabled = disabledProp || field.disabled;

    const latest = useRef({
        value,
        typed,
        channel,
        space,
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
        channel,
        space,
        locale,
        disabled,
        readOnly,
        defaultValue,
        setOwnValue,
        reset: field.reset,
    };

    const actions = useMemo(() => {
        const setValue = (next: Color | null, details: ChangeDetails) => {
            if (!isSameColor(next, latest.current.value)) {
                latest.current.setOwnValue(next, details);
            }
        };
        /** The channel's number in `text` (channel mode), or `null`. */
        const channelOf = (text: string): number | null => {
            const { channel: edited, locale: lang } = latest.current;
            if (edited === undefined) {
                return null;
            }
            const { format, scale } = colorChannelFormat(edited);
            const parsed = parseNumber(text, { locale: lang, format });
            return parsed === null || Number.isNaN(parsed)
                ? null
                : round2(clampColorChannel(edited, parsed / scale));
        };
        const withChannel = (number: number): Color => {
            const { value: now, channel: edited, space: own } = latest.current;
            return setColorChannel(
                now ?? black(own),
                edited as ColorChannel,
                clampColorChannel(edited as ColorChannel, round2(number)),
            );
        };
        return {
            onInputText: (text: string) => setTyped(text),
            commitText: (reason: "keyboard" | "input-blur", event: Event) => {
                const { typed: text, channel: edited } = latest.current;
                if (text === null) {
                    return;
                }
                setTyped(null);
                if (edited === undefined) {
                    if (text.trim() === "") {
                        setValue(null, { reason: "input-clear", event });
                        return;
                    }
                    const parsed = parseColor(text);
                    if (parsed !== null) {
                        setValue(parsed, { reason, event });
                    }
                    return;
                }
                const number = channelOf(text);
                if (number !== null) {
                    setValue(withChannel(number), { reason, event });
                }
            },
            stepKey: (key: string, shiftKey: boolean, event: Event) => {
                const state = latest.current;
                if (state.disabled || state.readOnly) {
                    return false;
                }
                const reason: ChangeReason = "keyboard";
                const edited = state.channel;
                if (edited === undefined) {
                    if (key !== "ArrowUp" && key !== "ArrowDown") {
                        return false;
                    }
                    const base =
                        state.typed === null
                            ? state.value
                            : (parseColor(state.typed) ?? state.value);
                    setTyped(null);
                    setValue(stepHex(base, key === "ArrowUp" ? 1 : -1), {
                        reason,
                        event,
                    });
                    return true;
                }
                const range = colorChannelRange(edited);
                const typedNumber =
                    state.typed === null ? null : channelOf(state.typed);
                const base =
                    typedNumber ??
                    (state.value === null
                        ? range.min
                        : getColorChannel(state.value, edited));
                const amount = shiftKey ? range.largeStep : range.step;
                let next: number;
                switch (key) {
                    case "ArrowUp":
                        next = base + amount;
                        break;
                    case "ArrowDown":
                        next = base - amount;
                        break;
                    case "PageUp":
                        next = base + range.largeStep;
                        break;
                    case "PageDown":
                        next = base - range.largeStep;
                        break;
                    case "Home":
                        next = range.min;
                        break;
                    case "End":
                        next = range.max;
                        break;
                    default:
                        return false;
                }
                setTyped(null);
                setValue(withChannel(next), { reason, event });
                return true;
            },
        };
    }, []);

    // a form reset returns it to its default, and its text with it
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
                const next = toColor(state.defaultValue) ?? null;
                if (!isSameColor(next, state.value)) {
                    state.setOwnValue(next, { reason: "none" });
                }
            },
            invalid: () => input,
        });
    }, [input]);

    const state: ColorFieldState = {
        value,
        inputValue: typed ?? valueText,
        disabled,
        readOnly,
        required,
    };
    const attributes = {
        ...stateAttributes({
            disabled,
            readonly: readOnly,
            required,
            channel,
        }),
        ...field.attributes,
    };
    const context: ColorFieldContextValue = {
        ...state,
        channel,
        channelValue,
        range: channel === undefined ? undefined : colorChannelRange(channel),
        valueText,
        inputId,
        field,
        attributes,
        onInputText: actions.onInputText,
        commitText: actions.commitText,
        stepKey: actions.stepKey,
        setInputElement,
    };
    return (
        <ColorFieldContext.Provider value={context}>
            {renderElement("div", { ...props, children }, state, {
                "data-primitives-part": "color-field-root",
                ...attributes,
            })}
            <input
                ref={hidden}
                type="text"
                aria-hidden="true"
                tabIndex={-1}
                name={field.name ?? name}
                value={formValue}
                required={required}
                disabled={disabled}
                onChange={NOOP}
                onFocus={() => input?.focus()}
                style={VISUALLY_HIDDEN_INPUT_STYLE}
                data-primitives-part="color-field-hidden-input"
            />
        </ColorFieldContext.Provider>
    );
}
