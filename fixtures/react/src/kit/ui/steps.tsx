import { Steps as Primitive } from "@fragiola/primitives-react/steps";
import { steps } from "examples-shared/recipes/steps";
import type { ComponentProps } from "react";

export const Steps = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={steps.root} {...props} />
    ),
    List: (props: ComponentProps<typeof Primitive.List>) => (
        <Primitive.List className={steps.list} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={steps.item} {...props} />
    ),
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={steps.trigger} {...props} />
    ),
    Indicator: (props: ComponentProps<typeof Primitive.Indicator>) => (
        <Primitive.Indicator className={steps.indicator} {...props} />
    ),
    Separator: (props: ComponentProps<typeof Primitive.Separator>) => (
        <Primitive.Separator className={steps.separator} {...props} />
    ),
    Content: (props: ComponentProps<typeof Primitive.Content>) => (
        <Primitive.Content className={steps.content} {...props} />
    ),
    CompletedContent: (
        props: ComponentProps<typeof Primitive.CompletedContent>,
    ) => <Primitive.CompletedContent className={steps.content} {...props} />,
    PrevTrigger: (props: ComponentProps<typeof Primitive.PrevTrigger>) => (
        <Primitive.PrevTrigger className={steps.control} {...props} />
    ),
    NextTrigger: (props: ComponentProps<typeof Primitive.NextTrigger>) => (
        <Primitive.NextTrigger className={steps.control} {...props} />
    ),
};
