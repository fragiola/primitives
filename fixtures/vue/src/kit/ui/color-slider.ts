import { ColorSlider as Primitive } from "@fragiola/primitives-vue/color-slider";
import { colorSlider } from "examples-shared/recipes/color-slider";
import { styled } from "../styled.ts";

export const ColorSlider = {
    Root: styled(Primitive.Root, colorSlider.root),
    Label: styled(Primitive.Label, colorSlider.label),
    Output: styled(Primitive.Output, colorSlider.output),
    Track: styled(Primitive.Track, colorSlider.track),
    Thumb: styled(Primitive.Thumb, colorSlider.thumb),
};
