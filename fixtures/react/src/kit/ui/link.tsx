import { Link as Primitive } from "@fragiola/primitives-react/link";
import { link } from "examples-shared/recipes/link";
import type { ComponentProps } from "react";

export const Link = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={link.root} {...props} />
);
