import { Field as Primitive } from "@fragiola/primitives-vue/field";
import { field } from "examples-shared/recipes/field";
import { styled } from "../styled.ts";

export const Field = {
    Root: styled(Primitive.Root, field.root),
    Label: styled(Primitive.Label, field.label),
    Control: styled(Primitive.Control, field.control),
    Description: styled(Primitive.Description, field.description),
    Error: styled(Primitive.Error, field.error),
};
