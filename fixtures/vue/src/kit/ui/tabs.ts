import { Tabs as Primitive } from "@fragiola/primitives-vue/tabs";
import { tabs } from "examples-shared/recipes/tabs";
import { styled } from "../styled.ts";

export const Tabs = {
    Root: styled(Primitive.Root, tabs.root),
    List: styled(Primitive.List, tabs.list),
    Tab: styled(Primitive.Tab, tabs.tab),
    Indicator: styled(Primitive.Indicator, tabs.indicator),
    Panel: styled(Primitive.Panel, tabs.panel),
};
