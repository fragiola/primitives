import { ColorField as Primitive } from "@fragiola/primitives-vue/color-field";
import { colorField } from "examples-shared/recipes/color-field";
import { styled } from "../styled.ts";

export const ColorField = {
    Root: styled(Primitive.Root, colorField.root),
    Input: styled(Primitive.Input, colorField.input),
};
