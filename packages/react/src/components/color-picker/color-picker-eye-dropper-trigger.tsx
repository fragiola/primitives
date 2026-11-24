import { openEyeDropper, supportsEyeDropper } from "@fragiola/primitives/color";
import { type MouseEvent, useEffect, useState } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ColorPickerContext,
    type ColorPickerState,
} from "./color-picker-context.ts";

export interface ColorPickerEyeDropperTriggerProps
    extends PartProps<ColorPickerState> {}

/**
 * Picks a color on screen with the browser's eyedropper (spec/color-picker.md,
 * "EyeDropperTrigger"); rendered only once mounted where `EyeDropper` exists.
 */
export function ColorPickerEyeDropperTrigger(
    props: ColorPickerEyeDropperTriggerProps,
) {
    const context = useRequiredContext(
        ColorPickerContext,
        "ColorPicker.EyeDropperTrigger",
    );
    const { color, format, disabled, root, pick } = context;
    // the API is the browser's: read once mounted, so the server render and hydration match
    const [supported, setSupported] = useState(false);
    useEffect(() => {
        setSupported(root !== null && supportsEyeDropper(root));
    }, [root]);
    if (!supported) {
        return null;
    }
    return renderElement(
        "button",
        props,
        { color, format, disabled },
        {
            type: "button",
            disabled,
            "data-primitives-part": "color-picker-eye-dropper-trigger",
            ...stateAttributes({ disabled }),
            onClick: (event: MouseEvent<HTMLButtonElement>) => {
                const native = event.nativeEvent;
                void openEyeDropper(event.currentTarget).then((picked) => {
                    if (picked !== null) {
                        pick(picked, native);
                    }
                });
            },
        },
    );
}
