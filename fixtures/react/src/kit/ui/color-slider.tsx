import { ColorSlider as Primitive } from "@fragiola/primitives-react/color-slider";
import { colorSlider } from "examples-shared/recipes/color-slider";
import type { ComponentProps } from "react";

export const ColorSlider = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={colorSlider.root} {...props} />
    ),
    Label: (props: ComponentProps<typeof Primitive.Label>) => (
        <Primitive.Label className={colorSlider.label} {...props} />
    ),
    Output: (props: ComponentProps<typeof Primitive.Output>) => (
        <Primitive.Output className={colorSlider.output} {...props} />
    ),
    Track: (props: ComponentProps<typeof Primitive.Track>) => (
        <Primitive.Track className={colorSlider.track} {...props} />
    ),
    Thumb: (props: ComponentProps<typeof Primitive.Thumb>) => (
        <Primitive.Thumb className={colorSlider.thumb} {...props} />
    ),
};
