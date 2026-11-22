import { Form as Primitive } from "@fragiola/primitives-react/form";
import { form } from "examples-shared/recipes/form";
import type { ComponentProps } from "react";

export const Form = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={form.root} {...props} />
);
