import {
    type Color,
    formatColor,
    parseColor,
} from "@fragiola/primitives/color";
import { defineComponent, inject, type PropType } from "vue";
import { ColorPickerBindingKey } from "../../utils/color-picker-binding.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** What a ColorSwatch renders with (spec/color-swatch.md). */
export interface ColorSwatchState {
    /** The color it shows. */
    color: Color;
}

export interface ColorSwatchProps {
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
export const ColorSwatch: PartComponent<ColorSwatchProps, ColorSwatchState> =
    publicComponent(
        defineComponent({
            name: "ColorSwatch",
            inheritAttrs: false,
            props: {
                ...asProp,
                color: {
                    type: [Object, String] as PropType<Color | string>,
                    default: undefined,
                },
            },
            setup(props, { attrs, slots }) {
                const picker = inject(ColorPickerBindingKey, null);
                return () => {
                    const color =
                        props.color === undefined
                            ? (picker?.value() ?? TRANSPARENT)
                            : (parseColor(props.color) ?? TRANSPARENT);
                    const css = formatColor(color, "css");
                    const named =
                        attrs["aria-label"] !== undefined ||
                        attrs["aria-labelledby"] !== undefined;
                    return renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
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
                };
            },
        }),
    );
