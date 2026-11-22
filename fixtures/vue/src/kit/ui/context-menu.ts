import { ContextMenu as Primitive } from "@fragiola/primitives-vue/context-menu";
import { contextMenu } from "examples-shared/recipes/context-menu";
import { defineComponent, h } from "vue";
import { styled } from "../styled.ts";

export const ContextMenu = {
    Root: Primitive.Root,
    SubmenuRoot: Primitive.SubmenuRoot,
    Portal: Primitive.Portal,
    // as React's kit (`className={recipe} {...props}`): a class given to the area replaces the
    // recipe's, so both fixtures render the same area
    Trigger: defineComponent({
        name: "StyledContextMenuTrigger",
        inheritAttrs: false,
        setup(_, { attrs, slots }) {
            return () =>
                h(
                    Primitive.Trigger,
                    { ...attrs, class: attrs.class ?? contextMenu.trigger },
                    slots,
                );
        },
    }),
    Positioner: styled(Primitive.Positioner, contextMenu.positioner),
    Popup: styled(Primitive.Popup, contextMenu.popup),
    Item: styled(Primitive.Item, contextMenu.item),
    Separator: styled(Primitive.Separator, contextMenu.separator),
    SubmenuTrigger: styled(
        Primitive.SubmenuTrigger,
        contextMenu["submenu-trigger"],
    ),
};
