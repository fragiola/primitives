import { Editable as Primitive } from "@fragiola/primitives-vue/editable";
import { editable } from "examples-shared/recipes/editable";
import { type Component, defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";
import { icon } from "./icon.ts";

/** A styled trigger, with its icon (a pencil, a check, a cross). */
function trigger(component: Component, className: string, d: string) {
    return defineComponent({
        name: "StyledEditableTrigger",
        inheritAttrs: false,
        setup(_, { attrs }) {
            return () =>
                h(component, mergeProps({ class: className }, attrs), {
                    default: () => [icon("size-4", [h("path", { d })])],
                });
        },
    });
}

export const Editable = {
    Root: styled(Primitive.Root, editable.root),
    Area: styled(Primitive.Area, editable.area),
    Preview: styled(Primitive.Preview, editable.preview),
    Input: styled(Primitive.Input, editable.input),
    EditTrigger: trigger(
        Primitive.EditTrigger,
        editable["edit-trigger"],
        "M4 20h4L19 9l-4-4L4 16v4z",
    ),
    SubmitTrigger: trigger(
        Primitive.SubmitTrigger,
        editable["submit-trigger"],
        "M5 12l5 5L20 7",
    ),
    CancelTrigger: trigger(
        Primitive.CancelTrigger,
        editable["cancel-trigger"],
        "M6 6l12 12M18 6L6 18",
    ),
};
