import { ColorArea as Primitive } from "@fragiola/primitives-vue/color-area";
import { colorArea } from "examples-shared/recipes/color-area";
import { styled } from "../styled.ts";

export const ColorArea = {
    Root: styled(Primitive.Root, colorArea.root),
    Thumb: styled(Primitive.Thumb, colorArea.thumb),
    Input: styled(Primitive.Input, colorArea.input),
};
