import { Listbox as Primitive } from "@fragiola/primitives-vue/listbox";
import { listbox } from "examples-shared/recipes/listbox";
import { styled } from "../styled.ts";

export const Listbox = {
    Root: styled(Primitive.Root, listbox.root),
    Item: styled(Primitive.Item, listbox.item),
    ItemIndicator: styled(Primitive.ItemIndicator, listbox["item-indicator"]),
    Group: styled(Primitive.Group, listbox.group),
    GroupLabel: styled(Primitive.GroupLabel, listbox["group-label"]),
    Separator: styled(Primitive.Separator, listbox.separator),
};
