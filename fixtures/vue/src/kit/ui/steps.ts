import { Steps as Primitive } from "@fragiola/primitives-vue/steps";
import { steps } from "examples-shared/recipes/steps";
import { styled } from "../styled.ts";

export const Steps = {
    Root: styled(Primitive.Root, steps.root),
    List: styled(Primitive.List, steps.list),
    Item: styled(Primitive.Item, steps.item),
    Trigger: styled(Primitive.Trigger, steps.trigger),
    Indicator: styled(Primitive.Indicator, steps.indicator),
    Separator: styled(Primitive.Separator, steps.separator),
    Content: styled(Primitive.Content, steps.content),
    CompletedContent: styled(Primitive.CompletedContent, steps.content),
    PrevTrigger: styled(Primitive.PrevTrigger, steps.control),
    NextTrigger: styled(Primitive.NextTrigger, steps.control),
};
