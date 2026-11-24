import { Command as Primitive } from "@fragiola/primitives-vue/command";
import { CommandVirtual as VirtualPrimitive } from "@fragiola/primitives-vue/command-virtual";
import { command } from "examples-shared/recipes/command";
import { styled } from "../styled.ts";

export const Command = {
    Root: styled(Primitive.Root, command.root),
    Input: styled(Primitive.Input, command.input),
    List: styled(Primitive.List, command.list),
    Group: styled(Primitive.Group, command.group),
    GroupLabel: styled(Primitive.GroupLabel, command["group-label"]),
    Separator: styled(Primitive.Separator, command.separator),
    Item: styled(Primitive.Item, command.item),
    Empty: styled(Primitive.Empty, command.empty),
    Loading: styled(Primitive.Loading, command.loading),
};

export const CommandVirtual = {
    List: styled(VirtualPrimitive.List, command.list),
};
