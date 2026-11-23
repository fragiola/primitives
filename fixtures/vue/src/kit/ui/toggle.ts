import { Toggle as Primitive } from "@fragiola/primitives-vue/toggle";
import { toggle } from "examples-shared/recipes/toggle";
import { styled } from "../styled.ts";

export const Toggle = styled(Primitive, toggle.root);
