import {
    type Color,
    type ColorSpace,
    convertColor,
    formatColor,
    isSameColor,
    parseColor,
} from "@fragiola/primitives/color";
import { getTabbables } from "@fragiola/primitives/focus";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    type FocusEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { ColorPickerBindingContext } from "../../utils/color-picker-binding.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorPickerContext,
    type ColorPickerFormat,
    type ColorPickerState,
} from "./color-picker-context.ts";

const BLACK: Color = { space: "rgb", red: 0, green: 0, blue: 0, alpha: 1 };

/** A `Color`, or a string `parseColor` reads (black when it reads none). */
function toColor(value: Color | string | undefined): Color | undefined {
    return value === undefined ? undefined : (parseColor(value) ?? BLACK);
}

/** The space a format edits in (`hex`: rgb). */
function formatSpace(format: ColorPickerFormat): ColorSpace {
    return format === "hex" ? "rgb" : format;
}

export interface ColorPickerRootProps extends PartProps<ColorPickerState> {
    value?: Color | string;
    defaultValue?: Color | string;
    /** The color, as the control that changed it reports it. */
    onValueChange?: (value: Color, details: ChangeDetails) => void;
    /** Once a control's change is complete (a drag ended, a key, a commit, a choice, a pick). */
    onValueCommit?: (value: Color, details: ChangeDetails) => void;
    format?: ColorPickerFormat;
    defaultFormat?: ColorPickerFormat;
    onFormatChange?: (
        format: ColorPickerFormat,
        details: ChangeDetails,
    ) => void;
    /** Every control inside is disabled. */
    disabled?: boolean;
    name?: string;
}

/**
 * Holds one color and shares it with the color controls inside it (spec/color-picker.md): a
 * `group` with its format, its form value as hex and its Field binding.
 */
export function ColorPickerRoot({
    value: valueProp,
    defaultValue = "#000000",
    onValueChange,
    onValueCommit,
    format: formatProp,
    defaultFormat = "hex",
    onFormatChange,
    disabled: disabledProp = false,
    name,
    children,
    ...props
}: ColorPickerRootProps) {
    const [value, setValue] = useControllableState<Color, ChangeDetails>(
        toColor(valueProp),
        toColor(defaultValue) as Color,
        onValueChange,
    );
    const [format, setOwnFormat] = useControllableState<
        ColorPickerFormat,
        ChangeDetails
    >(formatProp, defaultFormat, onFormatChange);
    const [element, ref] = useElement<HTMLElement>();
    const hidden = useRef<HTMLInputElement>(null);
    const hex = formatColor(value, "hex");
    const field = useFieldControl({
        id: undefined,
        labelable: false,
        value: hex,
        // a picker always has a color
        filled: true,
        input: () => hidden.current,
        element: () => element,
        focusTarget: () =>
            element === null ? null : (getTabbables(element)[0] ?? null),
    });
    const disabled = disabledProp || field.disabled;

    const latest = useRef({ value, setValue, onValueCommit });
    latest.current = { value, setValue, onValueCommit };
    const commit = useCallback((color: Color, details: ChangeDetails) => {
        latest.current.onValueCommit?.(color, details);
    }, []);
    const setFormat = useCallback(
        (next: ColorPickerFormat, event: Event) => {
            const details = { reason: "input-change" as const, event };
            setOwnFormat(next, details);
            const { value: now, setValue: set } = latest.current;
            const space = formatSpace(next);
            if (now.space !== space) {
                set(convertColor(now, space), details);
            }
        },
        [setOwnFormat],
    );
    const pick = useCallback(
        (picked: Color, event: Event | undefined) => {
            const { value: now, setValue: set } = latest.current;
            const next = convertColor(
                { ...picked, alpha: now.alpha },
                now.space,
            );
            const details = { reason: "trigger-press" as const, event };
            set(next, details);
            commit(next, details);
        },
        [commit],
    );

    // a form reset returns the picker to its default, and every bound control with it
    const initial = useRef({ defaultValue, reset: field.reset });
    initial.current = { defaultValue, reset: field.reset };
    useEffect(() => {
        const input = hidden.current;
        if (input === null) {
            return undefined;
        }
        return bridgeForm(input, {
            reset: () => {
                const next = toColor(initial.current.defaultValue) as Color;
                if (!isSameColor(next, latest.current.value)) {
                    initial.current.reset();
                    latest.current.setValue(next, { reason: "none" });
                }
            },
        });
    }, []);

    const binding = useMemo(
        () => ({ value, setValue, commit, disabled }),
        [value, setValue, commit, disabled],
    );
    const context = useMemo(
        () => ({
            color: value,
            format,
            disabled,
            root: element,
            setFormat,
            pick,
        }),
        [value, format, disabled, element, setFormat, pick],
    );
    const state = { color: value, format, disabled };
    const formName = field.name ?? name;
    return (
        <ColorPickerBindingContext.Provider value={binding}>
            <ColorPickerContext.Provider value={context}>
                {renderElement(
                    "div",
                    {
                        ...props,
                        children: (
                            <>
                                {children}
                                <input
                                    ref={hidden}
                                    type="hidden"
                                    name={formName}
                                    value={hex}
                                    disabled={disabled}
                                    data-primitives-part="color-picker-input"
                                />
                            </>
                        ),
                    },
                    state,
                    {
                        role: "group",
                        ...field.aria,
                        style: {
                            "--color-picker-color": formatColor(value, "css"),
                        },
                        "data-primitives-part": "color-picker-root",
                        ...field.attributes,
                        ...stateAttributes({ format, disabled }),
                        onFocus: field.onFocus,
                        onBlur: (event: FocusEvent<HTMLElement>) => {
                            const next = event.relatedTarget;
                            if (
                                !(next instanceof Node) ||
                                !event.currentTarget.contains(next)
                            ) {
                                field.onBlur();
                            }
                        },
                    },
                    ref,
                )}
            </ColorPickerContext.Provider>
        </ColorPickerBindingContext.Provider>
    );
}
