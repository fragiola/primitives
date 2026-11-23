import { Carousel as Primitive } from "@fragiola/primitives-react/carousel";
import { carousel } from "examples-shared/recipes/carousel";
import type { ComponentProps } from "react";

export const Carousel = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={carousel.root} {...props} />
    ),
    ItemGroup: (props: ComponentProps<typeof Primitive.ItemGroup>) => (
        <Primitive.ItemGroup className={carousel.itemGroup} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={carousel.item} {...props} />
    ),
    PrevTrigger: (props: ComponentProps<typeof Primitive.PrevTrigger>) => (
        <Primitive.PrevTrigger className={carousel.control} {...props} />
    ),
    NextTrigger: (props: ComponentProps<typeof Primitive.NextTrigger>) => (
        <Primitive.NextTrigger className={carousel.control} {...props} />
    ),
    IndicatorGroup: (
        props: ComponentProps<typeof Primitive.IndicatorGroup>,
    ) => (
        <Primitive.IndicatorGroup
            className={carousel.indicatorGroup}
            {...props}
        />
    ),
    Indicator: (props: ComponentProps<typeof Primitive.Indicator>) => (
        <Primitive.Indicator className={carousel.indicator} {...props} />
    ),
    AutoplayTrigger: (
        props: ComponentProps<typeof Primitive.AutoplayTrigger>,
    ) => <Primitive.AutoplayTrigger className={carousel.control} {...props} />,
};
