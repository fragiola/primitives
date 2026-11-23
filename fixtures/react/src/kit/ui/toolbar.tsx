import { Toolbar as Primitive } from "@fragiola/primitives-react/toolbar";
import { toolbar } from "examples-shared/recipes/toolbar";
import type { ComponentProps } from "react";

export const Toolbar = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={toolbar.root} {...props} />
    ),
    Button: (props: ComponentProps<typeof Primitive.Button>) => (
        <Primitive.Button className={toolbar.button} {...props} />
    ),
    Link: (props: ComponentProps<typeof Primitive.Link>) => (
        <Primitive.Link className={toolbar.link} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={toolbar.input} {...props} />
    ),
    Group: (props: ComponentProps<typeof Primitive.Group>) => (
        <Primitive.Group className={toolbar.group} {...props} />
    ),
    Separator: (props: ComponentProps<typeof Primitive.Separator>) => (
        <Primitive.Separator className={toolbar.separator} {...props} />
    ),
};
