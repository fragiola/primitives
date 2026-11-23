import { Pagination as Primitive } from "@fragiola/primitives-vue/pagination";
import { pagination } from "examples-shared/recipes/pagination";
import { styled } from "../styled.ts";

export const Pagination = {
    Root: styled(Primitive.Root, pagination.root),
    Item: styled(Primitive.Item, pagination.item),
    Ellipsis: styled(Primitive.Ellipsis, pagination.ellipsis),
    Previous: styled(Primitive.Previous, pagination.control),
    Next: styled(Primitive.Next, pagination.control),
    First: styled(Primitive.First, pagination.control),
    Last: styled(Primitive.Last, pagination.control),
};
