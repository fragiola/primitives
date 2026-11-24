import { ColorSwatchPicker as Primitive } from "@fragiola/primitives-vue/color-swatch-picker";
import { colorSwatchPicker } from "examples-shared/recipes/color-swatch-picker";
import { styled } from "../styled.ts";

export const ColorSwatchPicker = {
    Root: styled(Primitive.Root, colorSwatchPicker.root),
    Item: styled(Primitive.Item, colorSwatchPicker.item),
};
