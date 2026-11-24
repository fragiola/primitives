import { ColorWheel as Primitive } from "@fragiola/primitives-vue/color-wheel";
import { colorWheel } from "examples-shared/recipes/color-wheel";
import { styled } from "../styled.ts";

export const ColorWheel = {
    Root: styled(Primitive.Root, colorWheel.root),
    Track: styled(Primitive.Track, colorWheel.track),
    Thumb: styled(Primitive.Thumb, colorWheel.thumb),
};
