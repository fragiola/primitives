import { Button as Primitive } from "@fragiola/primitives-vue/button";
import { button } from "examples-shared/recipes/button";
import { styled } from "../styled.ts";

export const Button = styled(Primitive, button.root);
