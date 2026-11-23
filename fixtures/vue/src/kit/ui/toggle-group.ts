import { ToggleGroup as Primitive } from "@fragiola/primitives-vue/toggle-group";
import { toggleGroup } from "examples-shared/recipes/toggle-group";
import { styled } from "../styled.ts";

export const ToggleGroup = styled(Primitive, toggleGroup.root);
