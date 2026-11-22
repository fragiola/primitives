import { Avatar as Primitive } from "@fragiola/primitives-vue/avatar";
import { avatar } from "examples-shared/recipes/avatar";
import { styled } from "../styled.ts";

export const Avatar = {
    Root: styled(Primitive.Root, avatar.root),
    Image: styled(Primitive.Image, avatar.image),
    Fallback: styled(Primitive.Fallback, avatar.fallback),
};
