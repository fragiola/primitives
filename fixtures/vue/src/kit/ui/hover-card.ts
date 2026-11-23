import { HoverCard as Primitive } from "@fragiola/primitives-vue/hover-card";
import { hoverCard } from "examples-shared/recipes/hover-card";
import { styled } from "../styled.ts";

export const HoverCard = {
    Root: Primitive.Root,
    createHandle: Primitive.createHandle,
    Portal: Primitive.Portal,
    Trigger: styled(Primitive.Trigger, hoverCard.trigger),
    Backdrop: styled(Primitive.Backdrop, hoverCard.backdrop),
    Positioner: styled(Primitive.Positioner, hoverCard.positioner),
    Popup: styled(Primitive.Popup, hoverCard.popup),
    Arrow: styled(Primitive.Arrow, hoverCard.arrow),
};
