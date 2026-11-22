import { Collapsible as Primitive } from "@fragiola/primitives-react/collapsible";
import { collapsible } from "examples-shared/recipes/collapsible";
import type { ComponentProps } from "react";

export const Collapsible = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={collapsible.root} {...props} />
    ),
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={collapsible.trigger} {...props} />
    ),
    Panel: (props: ComponentProps<typeof Primitive.Panel>) => (
        <Primitive.Panel className={collapsible.panel} {...props} />
    ),
};
