import { AspectRatio as Primitive } from "@fragiola/primitives-vue/aspect-ratio";
import { aspectRatio } from "examples-shared/recipes/aspect-ratio";
import { styled } from "../styled.ts";

export const AspectRatio = styled(Primitive, aspectRatio.root);
