import { DropZone as Primitive } from "@fragiola/primitives-react/drop-zone";
import { dropZone } from "examples-shared/recipes/drop-zone";
import type { ComponentProps } from "react";

export const DropZone = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={dropZone.root} {...props} />
    ),
};
