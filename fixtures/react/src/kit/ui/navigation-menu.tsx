import { NavigationMenu as Primitive } from "@fragiola/primitives-react/navigation-menu";
import { navigationMenu } from "examples-shared/recipes/navigation-menu";
import type { ComponentProps } from "react";

// The styled layer: each part gets its recipe (a per-framework Fragiola UI in miniature).
export const NavigationMenu = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={navigationMenu.root} {...props} />
    ),
    List: (props: ComponentProps<typeof Primitive.List>) => (
        <Primitive.List className={navigationMenu.list} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={navigationMenu.item} {...props} />
    ),
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={navigationMenu.trigger} {...props} />
    ),
    Icon: (props: ComponentProps<typeof Primitive.Icon>) => (
        <Primitive.Icon className={navigationMenu.icon} {...props} />
    ),
    Link: (props: ComponentProps<typeof Primitive.Link>) => (
        <Primitive.Link className={navigationMenu.link} {...props} />
    ),
    // a link inside a Content
    ContentLink: (props: ComponentProps<typeof Primitive.Link>) => (
        <Primitive.Link className={navigationMenu["content-link"]} {...props} />
    ),
    Content: (props: ComponentProps<typeof Primitive.Content>) => (
        <Primitive.Content className={navigationMenu.content} {...props} />
    ),
    Portal: Primitive.Portal,
    Backdrop: (props: ComponentProps<typeof Primitive.Backdrop>) => (
        <Primitive.Backdrop className={navigationMenu.backdrop} {...props} />
    ),
    Positioner: (props: ComponentProps<typeof Primitive.Positioner>) => (
        <Primitive.Positioner
            className={navigationMenu.positioner}
            {...props}
        />
    ),
    Popup: (props: ComponentProps<typeof Primitive.Popup>) => (
        <Primitive.Popup className={navigationMenu.popup} {...props} />
    ),
    Viewport: (props: ComponentProps<typeof Primitive.Viewport>) => (
        <Primitive.Viewport className={navigationMenu.viewport} {...props} />
    ),
    Arrow: (props: ComponentProps<typeof Primitive.Arrow>) => (
        <Primitive.Arrow className={navigationMenu.arrow} {...props} />
    ),
};
