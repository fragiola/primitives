import { ColorSwatchPicker as Primitive } from "@fragiola/primitives-react/color-swatch-picker";
import { colorSwatchPicker } from "examples-shared/recipes/color-swatch-picker";
import type { ComponentProps } from "react";

export const ColorSwatchPicker = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={colorSwatchPicker.root} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={colorSwatchPicker.item} {...props} />
    ),
};
