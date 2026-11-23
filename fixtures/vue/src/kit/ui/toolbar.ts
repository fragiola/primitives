import { Toolbar as Primitive } from "@fragiola/primitives-vue/toolbar";
import { toolbar } from "examples-shared/recipes/toolbar";
import { styled } from "../styled.ts";

export const Toolbar = {
    Root: styled(Primitive.Root, toolbar.root),
    Button: styled(Primitive.Button, toolbar.button),
    Link: styled(Primitive.Link, toolbar.link),
    Input: styled(Primitive.Input, toolbar.input),
    Group: styled(Primitive.Group, toolbar.group),
    Separator: styled(Primitive.Separator, toolbar.separator),
};
