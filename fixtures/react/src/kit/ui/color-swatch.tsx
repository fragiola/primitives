import { ColorSwatch as Primitive } from "@fragiola/primitives-react/color-swatch";
import { colorSwatch } from "examples-shared/recipes/color-swatch";
import type { ComponentProps } from "react";

export const ColorSwatch = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={colorSwatch.root} {...props} />
);
