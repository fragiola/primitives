import { ColorArea as Primitive } from "@fragiola/primitives-react/color-area";
import { colorArea } from "examples-shared/recipes/color-area";
import type { ComponentProps } from "react";

export const ColorArea = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={colorArea.root} {...props} />
    ),
    Thumb: (props: ComponentProps<typeof Primitive.Thumb>) => (
        <Primitive.Thumb className={colorArea.thumb} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={colorArea.input} {...props} />
    ),
};
