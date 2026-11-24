import { openEyeDropper, supportsEyeDropper } from "@fragiola/primitives/color";
import { type MouseEvent, useEffect, useRef, useState } from "react";
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
    // a pick that resolves once the picker is disabled, or the trigger unmounted, is dropped
    const latest = useRef({ disabled, pick });
    latest.current = { disabled, pick };
    const pending = useRef<AbortController | null>(null);
    useEffect(() => () => pending.current?.abort(), []);
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
                pending.current?.abort();
                const controller = new AbortController();
                pending.current = controller;
                void openEyeDropper(
                    event.currentTarget,
                    controller.signal,
                ).then((picked) => {
                    if (
                        picked !== null &&
                        !controller.signal.aborted &&
                        !latest.current.disabled
                    ) {
                        latest.current.pick(picked, native);
                    }
                });
            },
        },
    );
}
