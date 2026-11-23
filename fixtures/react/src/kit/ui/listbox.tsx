import { Listbox as Primitive } from "@fragiola/primitives-react/listbox";
import { listbox } from "examples-shared/recipes/listbox";
import type { ComponentProps } from "react";

export const Listbox = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={listbox.root} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={listbox.item} {...props} />
    ),
    ItemIndicator: (props: ComponentProps<typeof Primitive.ItemIndicator>) => (
        <Primitive.ItemIndicator
            className={listbox["item-indicator"]}
            {...props}
        />
    ),
    Group: (props: ComponentProps<typeof Primitive.Group>) => (
        <Primitive.Group className={listbox.group} {...props} />
    ),
    GroupLabel: (props: ComponentProps<typeof Primitive.GroupLabel>) => (
        <Primitive.GroupLabel className={listbox["group-label"]} {...props} />
    ),
    Separator: (props: ComponentProps<typeof Primitive.Separator>) => (
        <Primitive.Separator className={listbox.separator} {...props} />
    ),
};
