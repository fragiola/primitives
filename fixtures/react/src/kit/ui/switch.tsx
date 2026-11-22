import { Switch as Primitive } from "@fragiola/primitives-react/switch";
import { switchControl } from "examples-shared/recipes/switch";
import type { ComponentProps } from "react";

export const Switch = {
    /** The styled switch, with its thumb. */
    Root: ({ children, ...props }: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={switchControl.root} {...props}>
            {children ?? <Primitive.Thumb className={switchControl.thumb} />}
        </Primitive.Root>
    ),
};
