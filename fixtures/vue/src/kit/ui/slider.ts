import { Slider as Primitive } from "@fragiola/primitives-vue/slider";
import { slider } from "examples-shared/recipes/slider";
import { styled } from "../styled.ts";

export const Slider = {
    Root: styled(Primitive.Root, slider.root),
    Control: styled(Primitive.Control, slider.control),
    Track: styled(Primitive.Track, slider.track),
    Indicator: styled(Primitive.Indicator, slider.indicator),
    Thumb: styled(Primitive.Thumb, slider.thumb),
};
