import { DropZone as Primitive } from "@fragiola/primitives-vue/drop-zone";
import { dropZone } from "examples-shared/recipes/drop-zone";
import { styled } from "../styled.ts";

export const DropZone = {
    Root: styled(Primitive.Root, dropZone.root),
};
