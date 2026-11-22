import { Drawer as Primitive } from "@fragiola/primitives-vue/drawer";
import { drawer } from "examples-shared/recipes/drawer";
import { defineComponent, h } from "vue";
import { styled } from "../styled.ts";

export const Drawer = {
    Root: Primitive.Root,
    createHandle: Primitive.createHandle,
    Portal: Primitive.Portal,
    Trigger: styled(Primitive.Trigger, drawer.trigger),
    Backdrop: styled(Primitive.Backdrop, drawer.backdrop),
    Viewport: styled(Primitive.Viewport, drawer.viewport),
    Popup: styled(Primitive.Popup, drawer.popup),
    Content: styled(Primitive.Content, drawer.content),
    Title: styled(Primitive.Title, drawer.title),
    Description: styled(Primitive.Description, drawer.description),
    Close: styled(Primitive.Close, drawer.close),
    // the bar a mouse swipes from: no part
    Handle: defineComponent({
        name: "DrawerHandle",
        setup() {
            return () =>
                h("div", {
                    "aria-hidden": "true",
                    "data-testid": "drawer-handle",
                    class: drawer.handle,
                });
        },
    }),
};
