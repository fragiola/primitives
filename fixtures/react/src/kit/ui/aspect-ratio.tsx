import { AspectRatio as Primitive } from "@fragiola/primitives-react/aspect-ratio";
import { aspectRatio } from "examples-shared/recipes/aspect-ratio";
import type { ComponentProps } from "react";

export const AspectRatio = (props: ComponentProps<typeof Primitive>) => (
    <Primitive className={aspectRatio.root} {...props} />
);
