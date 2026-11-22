import { AlertDialog as Primitive } from "@fragiola/primitives-vue/alert-dialog";
import { alertDialog } from "examples-shared/recipes/alert-dialog";
import { defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

export const AlertDialog = {
    Root: Primitive.Root,
    createHandle: Primitive.createHandle,
    Portal: Primitive.Portal,
    Trigger: styled(Primitive.Trigger, alertDialog.trigger),
    Backdrop: styled(Primitive.Backdrop, alertDialog.backdrop),
    Viewport: styled(Primitive.Viewport, alertDialog.viewport),
    Popup: styled(Primitive.Popup, alertDialog.popup),
    Title: styled(Primitive.Title, alertDialog.title),
    Description: styled(Primitive.Description, alertDialog.description),
    Close: styled(Primitive.Close, alertDialog.close),
    // the app's own destructive answer: a plain button (no part)
    Action: defineComponent({
        name: "AlertDialogAction",
        inheritAttrs: false,
        setup(_, { attrs, slots }) {
            return () =>
                h(
                    "button",
                    mergeProps(
                        { type: "button", class: alertDialog.action },
                        attrs,
                    ),
                    slots.default?.(),
                );
        },
    }),
};
