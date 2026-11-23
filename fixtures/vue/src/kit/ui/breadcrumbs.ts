import { Breadcrumbs as Primitive } from "@fragiola/primitives-vue/breadcrumbs";
import { breadcrumbs } from "examples-shared/recipes/breadcrumbs";
import { styled } from "../styled.ts";

export const Breadcrumbs = {
    Root: styled(Primitive.Root, breadcrumbs.root),
    List: styled(Primitive.List, breadcrumbs.list),
    Item: styled(Primitive.Item, breadcrumbs.item),
    Link: styled(Primitive.Link, breadcrumbs.link),
    Current: styled(Primitive.Current, breadcrumbs.current),
    Separator: styled(Primitive.Separator, breadcrumbs.separator),
    Ellipsis: styled(Primitive.Ellipsis, breadcrumbs.ellipsis),
};
