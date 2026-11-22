import { Menu as Primitive } from "@fragiola/primitives-vue/menu";
import { menu } from "examples-shared/recipes/menu";
import { styled } from "../styled.ts";

export const Menu = {
    Root: Primitive.Root,
    createHandle: Primitive.createHandle,
    SubmenuRoot: Primitive.SubmenuRoot,
    Portal: Primitive.Portal,
    Trigger: styled(Primitive.Trigger, menu.trigger),
    Positioner: styled(Primitive.Positioner, menu.positioner),
    Popup: styled(Primitive.Popup, menu.popup),
    Item: styled(Primitive.Item, menu.item),
    Separator: styled(Primitive.Separator, menu.separator),
    Group: styled(Primitive.Group, menu.group),
    GroupLabel: styled(Primitive.GroupLabel, menu["group-label"]),
    CheckboxItem: styled(Primitive.CheckboxItem, menu["checkbox-item"]),
    CheckboxItemIndicator: styled(
        Primitive.CheckboxItemIndicator,
        menu["checkbox-item-indicator"],
    ),
    RadioGroup: styled(Primitive.RadioGroup, menu["radio-group"]),
    RadioItem: styled(Primitive.RadioItem, menu["radio-item"]),
    RadioItemIndicator: styled(
        Primitive.RadioItemIndicator,
        menu["radio-item-indicator"],
    ),
    SubmenuTrigger: styled(Primitive.SubmenuTrigger, menu["submenu-trigger"]),
};
