import { Label as Primitive } from "@fragiola/primitives-react/label";
import { label } from "examples-shared/recipes/label";
import type { ComponentProps } from "react";

export const Label = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={label.root} {...props} />
);
