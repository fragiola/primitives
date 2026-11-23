import { Carousel as Primitive } from "@fragiola/primitives-vue/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import { styled } from "../styled.ts";

export const Carousel = {
    Root: styled(Primitive.Root, carousel.root),
    ItemGroup: styled(Primitive.ItemGroup, carousel.itemGroup),
    Item: styled(Primitive.Item, carousel.item),
    PrevTrigger: styled(Primitive.PrevTrigger, carousel.control),
    NextTrigger: styled(Primitive.NextTrigger, carousel.control),
    IndicatorGroup: styled(Primitive.IndicatorGroup, carousel.indicatorGroup),
    Indicator: styled(Primitive.Indicator, carousel.indicator),
    AutoplayTrigger: styled(Primitive.AutoplayTrigger, carousel.control),
};
