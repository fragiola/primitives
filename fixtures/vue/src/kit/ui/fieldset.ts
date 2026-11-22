import { Fieldset as Primitive } from "@fragiola/primitives-vue/fieldset";
import { fieldset } from "examples-shared/recipes/fieldset";
import { styled } from "../styled.ts";

export const Fieldset = {
    Root: styled(Primitive.Root, fieldset.root),
    Legend: styled(Primitive.Legend, fieldset.legend),
};
