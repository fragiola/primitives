import { Drawer as Primitive } from "@fragiola/primitives-react/drawer";
import { drawer } from "examples-shared/recipes/drawer";
import type { ComponentProps } from "react";

// The styled layer: each part gets its recipe (a per-framework Fragiola UI in miniature).
export const Drawer = {
    Root: Primitive.Root,
    createHandle: Primitive.createHandle,
    Portal: Primitive.Portal,
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={drawer.trigger} {...props} />
    ),
    Backdrop: (props: ComponentProps<typeof Primitive.Backdrop>) => (
        <Primitive.Backdrop className={drawer.backdrop} {...props} />
    ),
    Viewport: (props: ComponentProps<typeof Primitive.Viewport>) => (
        <Primitive.Viewport className={drawer.viewport} {...props} />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={drawer.popup} {...props} />
    ),
    Content: (props: ComponentProps<typeof Primitive.Content>) => (
        <Primitive.Content className={drawer.content} {...props} />
    ),
    Title: (props: ComponentProps<typeof Primitive.Title>) => (
        <Primitive.Title className={drawer.title} {...props} />
    ),
    Description: (props: ComponentProps<typeof Primitive.Description>) => (
        <Primitive.Description className={drawer.description} {...props} />
    ),
    Close: (props: ComponentProps<typeof Primitive.Close>) => (
        <Primitive.Close className={drawer.close} {...props} />
    ),
    // the bar a mouse swipes from: no part
    Handle: () => (
        <div
            aria-hidden="true"
            data-testid="drawer-handle"
            className={drawer.handle}
        />
    ),
};
