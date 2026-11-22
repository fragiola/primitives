import { NavigationMenu as Primitive } from "@fragiola/primitives-vue/navigation-menu";
import { navigationMenu } from "examples-shared/recipes/navigation-menu";
import { styled } from "../styled.ts";

export const NavigationMenu = {
    Root: styled(Primitive.Root, navigationMenu.root),
    List: styled(Primitive.List, navigationMenu.list),
    Item: styled(Primitive.Item, navigationMenu.item),
    Trigger: styled(Primitive.Trigger, navigationMenu.trigger),
    Icon: styled(Primitive.Icon, navigationMenu.icon),
    Link: styled(Primitive.Link, navigationMenu.link),
    // a link inside a Content
    ContentLink: styled(Primitive.Link, navigationMenu["content-link"]),
    Content: styled(Primitive.Content, navigationMenu.content),
    Portal: Primitive.Portal,
    Backdrop: styled(Primitive.Backdrop, navigationMenu.backdrop),
    Positioner: styled(Primitive.Positioner, navigationMenu.positioner),
    Popup: styled(Primitive.Popup, navigationMenu.popup),
    Viewport: styled(Primitive.Viewport, navigationMenu.viewport),
    Arrow: styled(Primitive.Arrow, navigationMenu.arrow),
};
