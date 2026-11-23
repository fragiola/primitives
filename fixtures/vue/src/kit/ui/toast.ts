import { Toast as Primitive } from "@fragiola/primitives-vue/toast";
import { toast } from "examples-shared/recipes/toast";
import { styled } from "../styled.ts";

export const Toast = {
    Provider: Primitive.Provider,
    Portal: Primitive.Portal,
    useToastManager: Primitive.useToastManager,
    Viewport: styled(Primitive.Viewport, toast.viewport),
    Root: styled(Primitive.Root, toast.root),
    Title: styled(Primitive.Title, toast.title),
    Description: styled(Primitive.Description, toast.description),
    Action: styled(Primitive.Action, toast.action),
    Close: styled(Primitive.Close, toast.close),
};
