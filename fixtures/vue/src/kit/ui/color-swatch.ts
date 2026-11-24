import { ColorSwatch as Primitive } from "@fragiola/primitives-vue/color-swatch";
import { colorSwatch } from "examples-shared/recipes/color-swatch";
import { styled } from "../styled.ts";

export const ColorSwatch = styled(Primitive, colorSwatch.root);
