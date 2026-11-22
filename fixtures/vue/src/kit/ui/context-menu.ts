import { ContextMenu as Primitive } from "@fragiola/primitives-vue/context-menu";
import { contextMenu } from "examples-shared/recipes/context-menu";
import { styled } from "../styled.ts";

export const ContextMenu = {
    Root: Primitive.Root,
    SubmenuRoot: Primitive.SubmenuRoot,
    Portal: Primitive.Portal,
    Trigger: styled(Primitive.Trigger, contextMenu.trigger),
    Positioner: styled(Primitive.Positioner, contextMenu.positioner),
    Popup: styled(Primitive.Popup, contextMenu.popup),
    Item: styled(Primitive.Item, contextMenu.item),
    Separator: styled(Primitive.Separator, contextMenu.separator),
    SubmenuTrigger: styled(
        Primitive.SubmenuTrigger,
        contextMenu["submenu-trigger"],
    ),
};
