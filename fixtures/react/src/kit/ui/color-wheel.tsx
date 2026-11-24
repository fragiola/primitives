import { ColorWheel as Primitive } from "@fragiola/primitives-react/color-wheel";
import { colorWheel } from "examples-shared/recipes/color-wheel";
import type { ComponentProps } from "react";

export const ColorWheel = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={colorWheel.root} {...props} />
    ),
    Track: (props: ComponentProps<typeof Primitive.Track>) => (
        <Primitive.Track className={colorWheel.track} {...props} />
    ),
    Thumb: (props: ComponentProps<typeof Primitive.Thumb>) => (
        <Primitive.Thumb className={colorWheel.thumb} {...props} />
    ),
};
