import {
    type Color,
    formatColor,
    parseColor,
} from "@fragiola/primitives/color";
import { useContext } from "react";
import { ColorPickerBindingContext } from "../../utils/color-picker-binding.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";

/** What a ColorSwatch renders with (spec/color-swatch.md). */
export interface ColorSwatchState {
    /** The color it shows. */
    color: Color;
}

export interface ColorSwatchProps extends PartProps<ColorSwatchState> {
    /** The color it shows (default: an enclosing ColorPicker's, else transparent black). */
    color?: Color | string;
}

const TRANSPARENT: Color = {
    space: "rgb",
    red: 0,
    green: 0,
    blue: 0,
    alpha: 0,
};

/**
 * A preview of a color (spec/color-swatch.md): an `img` the app names (else named by the color's
 * CSS text), its color and its opaque color as CSS variables a recipe draws over a checkerboard.
 */
export function ColorSwatch({ color: colorProp, ...props }: ColorSwatchProps) {
    const picker = useContext(ColorPickerBindingContext);
    const color =
        colorProp === undefined
            ? (picker?.value ?? TRANSPARENT)
            : (parseColor(colorProp) ?? TRANSPARENT);
    const css = formatColor(color, "css");
    const named =
        props["aria-label"] !== undefined ||
        props["aria-labelledby"] !== undefined;
    return renderElement(
        "div",
        props,
        { color },
        {
            role: "img",
            "aria-label": named ? undefined : css,
            style: {
                "--color-swatch-color": css,
                "--color-swatch-color-opaque": formatColor(
                    { ...color, alpha: 1 },
                    "css",
                ),
            },
            "data-primitives-part": "color-swatch-root",
        },
    );
}
