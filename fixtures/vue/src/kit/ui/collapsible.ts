import { Collapsible as Primitive } from "@fragiola/primitives-vue/collapsible";
import { collapsible } from "examples-shared/recipes/collapsible";
import { styled } from "../styled.ts";

export const Collapsible = {
    Root: styled(Primitive.Root, collapsible.root),
    Trigger: styled(Primitive.Trigger, collapsible.trigger),
    Panel: styled(Primitive.Panel, collapsible.panel),
};
