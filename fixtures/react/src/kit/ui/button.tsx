import { Button as Primitive } from "@fragiola/primitives-react/button";
import { button } from "examples-shared/recipes/button";
import type { ComponentProps } from "react";

export const Button = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={button.root} {...props} />
);
