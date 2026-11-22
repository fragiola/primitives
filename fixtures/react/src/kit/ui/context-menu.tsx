import { ContextMenu as Primitive } from "@fragiola/primitives-react/context-menu";
import { contextMenu } from "examples-shared/recipes/context-menu";
import type { ComponentProps } from "react";

export const ContextMenu = {
    Root: Primitive.Root,
    SubmenuRoot: Primitive.SubmenuRoot,
    Portal: Primitive.Portal,
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={contextMenu.trigger} {...props} />
    ),
    Positioner: (props: ComponentProps<typeof Primitive.Positioner>) => (
        <Primitive.Positioner className={contextMenu.positioner} {...props} />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={contextMenu.popup} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={contextMenu.item} {...props} />
    ),
    Separator: (props: ComponentProps<typeof Primitive.Separator>) => (
        <Primitive.Separator className={contextMenu.separator} {...props} />
    ),
    SubmenuTrigger: (
        props: ComponentProps<typeof Primitive.SubmenuTrigger>,
    ) => (
        <Primitive.SubmenuTrigger
            className={contextMenu["submenu-trigger"]}
            {...props}
        />
    ),
};
