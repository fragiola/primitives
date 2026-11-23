import { PasswordInput as Primitive } from "@fragiola/primitives-vue/password-input";
import { passwordInput } from "examples-shared/recipes/password-input";
import { type Component, defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";
import { icon } from "./icon.ts";

const EYE = "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z";

/** The styled trigger, with its eye icons (the recipe shows one by `data-visible`). */
const VisibilityTrigger = defineComponent({
    name: "StyledPasswordInputVisibilityTrigger",
    inheritAttrs: false,
    setup(_, { attrs }) {
        return () =>
            h(
                Primitive.VisibilityTrigger as Component,
                mergeProps(
                    { class: passwordInput["visibility-trigger"] },
                    attrs,
                ),
                {
                    default: () => [
                        icon(passwordInput.show, [
                            h("path", { d: EYE }),
                            h("circle", { cx: "12", cy: "12", r: "3" }),
                        ]),
                        icon(passwordInput.hide, [
                            h("path", { d: EYE }),
                            h("path", { d: "M3 3l18 18" }),
                        ]),
                    ],
                },
            );
    },
});

export const PasswordInput = {
    Root: styled(Primitive.Root, passwordInput.root),
    Input: styled(Primitive.Input, passwordInput.input),
    VisibilityTrigger,
};
