import { Separator as Primitive } from "@fragiola/primitives-react/separator";
import { separator } from "examples-shared/recipes/separator";
import type { ComponentProps } from "react";

export const Separator = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={separator.root} {...props} />
);
