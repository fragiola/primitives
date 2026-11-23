import { Label as Primitive } from "@fragiola/primitives-vue/label";
import { label } from "examples-shared/recipes/label";
import { styled } from "../styled.ts";

export const Label = styled(Primitive, label.root);
