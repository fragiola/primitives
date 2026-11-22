import { Accordion as Primitive } from "@fragiola/primitives-vue/accordion";
import { accordion } from "examples-shared/recipes/accordion";
import { styled } from "../styled.ts";

export const Accordion = {
    Root: styled(Primitive.Root, accordion.root),
    Item: styled(Primitive.Item, accordion.item),
    Header: styled(Primitive.Header, accordion.header),
    Trigger: styled(Primitive.Trigger, accordion.trigger),
    Panel: styled(Primitive.Panel, accordion.panel),
};
