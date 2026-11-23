import { HoverCard as Primitive } from "@fragiola/primitives-react/hover-card";
import { hoverCard } from "examples-shared/recipes/hover-card";
import type { ComponentProps } from "react";

export const HoverCard = {
    Root: Primitive.Root,
    createHandle: Primitive.createHandle,
    Portal: Primitive.Portal,
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={hoverCard.trigger} {...props} />
    ),
    Backdrop: (props: ComponentProps<typeof Primitive.Backdrop>) => (
        <Primitive.Backdrop className={hoverCard.backdrop} {...props} />
    ),
    Positioner: (props: ComponentProps<typeof Primitive.Positioner>) => (
        <Primitive.Positioner className={hoverCard.positioner} {...props} />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={hoverCard.popup} {...props} />
    ),
    Arrow: (props: ComponentProps<typeof Primitive.Arrow>) => (
        <Primitive.Arrow className={hoverCard.arrow} {...props} />
    ),
};
