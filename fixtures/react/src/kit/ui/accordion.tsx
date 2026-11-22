import { Accordion as Primitive } from "@fragiola/primitives-react/accordion";
import { accordion } from "examples-shared/recipes/accordion";
import type { ComponentProps } from "react";

export const Accordion = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={accordion.root} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={accordion.item} {...props} />
    ),
    Header: (props: ComponentProps<typeof Primitive.Header>) => (
        <Primitive.Header className={accordion.header} {...props} />
    ),
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={accordion.trigger} {...props} />
    ),
    Panel: (props: ComponentProps<typeof Primitive.Panel>) => (
        <Primitive.Panel className={accordion.panel} {...props} />
    ),
};
