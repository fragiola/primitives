import { ColorField as Primitive } from "@fragiola/primitives-react/color-field";
import { colorField } from "examples-shared/recipes/color-field";
import type { ComponentProps } from "react";

export const ColorField = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={colorField.root} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={colorField.input} {...props} />
    ),
};
