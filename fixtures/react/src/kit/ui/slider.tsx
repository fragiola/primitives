import { Slider as Primitive } from "@fragiola/primitives-react/slider";
import { slider } from "examples-shared/recipes/slider";
import type { ComponentProps } from "react";

export const Slider = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={slider.root} {...props} />
    ),
    Label: (props: ComponentProps<typeof Primitive.Label>) => (
        <Primitive.Label className={slider.label} {...props} />
    ),
    Value: (props: ComponentProps<typeof Primitive.Value>) => (
        <Primitive.Value className={slider.value} {...props} />
    ),
    Control: (props: ComponentProps<typeof Primitive.Control>) => (
        <Primitive.Control className={slider.control} {...props} />
    ),
    Track: (props: ComponentProps<typeof Primitive.Track>) => (
        <Primitive.Track className={slider.track} {...props} />
    ),
    Indicator: (props: ComponentProps<typeof Primitive.Indicator>) => (
        <Primitive.Indicator className={slider.indicator} {...props} />
    ),
    Thumb: (props: ComponentProps<typeof Primitive.Thumb>) => (
        <Primitive.Thumb className={slider.thumb} {...props} />
    ),
};
