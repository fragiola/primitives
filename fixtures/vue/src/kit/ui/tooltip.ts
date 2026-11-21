import { Tooltip as Primitive } from "@fragiola/primitives-vue/tooltip";
import { tooltip } from "examples-shared/recipes/tooltip";
import { styled } from "../styled.ts";

export const Tooltip = {
    Provider: Primitive.Provider,
    Root: Primitive.Root,
    Portal: Primitive.Portal,
    Trigger: styled(Primitive.Trigger, tooltip.trigger),
    Positioner: styled(Primitive.Positioner, tooltip.positioner),
    Popup: styled(Primitive.Popup, tooltip.popup),
    Arrow: styled(Primitive.Arrow, tooltip.arrow),
};
