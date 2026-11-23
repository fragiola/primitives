import { ToggleGroup as Primitive } from "@fragiola/primitives-react/toggle-group";
import { toggleGroup } from "examples-shared/recipes/toggle-group";
import type { ComponentProps } from "react";

export const ToggleGroup = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={toggleGroup.root} {...props} />
);
