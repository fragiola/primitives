import { Toggle as Primitive } from "@fragiola/primitives-react/toggle";
import { toggle } from "examples-shared/recipes/toggle";
import type { ComponentProps } from "react";

export const Toggle = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={toggle.root} {...props} />
);
