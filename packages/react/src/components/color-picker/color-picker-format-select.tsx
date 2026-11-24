import { type ChangeEvent, useLayoutEffect } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    COLOR_PICKER_FORMATS,
    ColorPickerContext,
    type ColorPickerFormat,
    type ColorPickerState,
} from "./color-picker-context.ts";

export interface ColorPickerFormatSelectProps
    extends PartProps<ColorPickerState> {}

/**
 * A native `select` of the picker's format (spec/color-picker.md, "The format"); its `option`s
 * and their text are the app's.
 */
export function ColorPickerFormatSelect(props: ColorPickerFormatSelectProps) {
    const context = useRequiredContext(
        ColorPickerContext,
        "ColorPicker.FormatSelect",
    );
    const { color, format, disabled } = context;
    // the selected option is the select's own state, set once mounted (a server writes a
    // `selected` attribute for React's `value`, which the client's render never has); its default
    // too, so a form reset shows the picker's format again (the format is no form value)
    const [element, ref] = useElement<HTMLSelectElement>();
    useLayoutEffect(() => {
        if (element === null) {
            return;
        }
        for (const option of element.options) {
            option.defaultSelected = option.value === format;
        }
        element.value = format;
    });
    return renderElement(
        "select",
        props,
        { color, format, disabled },
        {
            disabled,
            "data-primitives-part": "color-picker-format-select",
            ...stateAttributes({ format, disabled }),
            onChange: (event: ChangeEvent<HTMLSelectElement>) => {
                const next = event.currentTarget.value as ColorPickerFormat;
                if (COLOR_PICKER_FORMATS.includes(next)) {
                    context.setFormat(next, event.nativeEvent);
                }
                // the format the picker holds, until a render shows the accepted one (a change
                // a controlled `format` refuses renders nothing)
                event.currentTarget.value = format;
            },
        },
        ref,
    );
}
