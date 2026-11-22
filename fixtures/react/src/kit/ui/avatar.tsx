import { Avatar as Primitive } from "@fragiola/primitives-react/avatar";
import { avatar } from "examples-shared/recipes/avatar";
import type { ComponentProps } from "react";

export const Avatar = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={avatar.root} {...props} />
    ),
    Image: (props: ComponentProps<typeof Primitive.Image>) => (
        <Primitive.Image className={avatar.image} {...props} />
    ),
    Fallback: (props: ComponentProps<typeof Primitive.Fallback>) => (
        <Primitive.Fallback className={avatar.fallback} {...props} />
    ),
};
