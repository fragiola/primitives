import { NumberField as Primitive } from "@fragiola/primitives-vue/number-field";
import { numberField } from "examples-shared/recipes/number-field";
import { type Component, defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

/** A styled button, with its sign. */
function stepper(component: Component, className: string, sign: string) {
    return defineComponent({
        name: "StyledNumberFieldStepper",
        inheritAttrs: false,
        setup(_, { attrs }) {
            return () =>
                h(component, mergeProps({ class: className }, attrs), {
                    default: () => [sign],
                });
        },
    });
}

export const NumberField = {
    Root: styled(Primitive.Root, numberField.root),
    Group: styled(Primitive.Group, numberField.group),
    Input: styled(Primitive.Input, numberField.input),
    Increment: stepper(Primitive.Increment, numberField.increment, "+"),
    Decrement: stepper(Primitive.Decrement, numberField.decrement, "−"),
    ScrubArea: styled(Primitive.ScrubArea, numberField.scrubArea),
    ScrubAreaCursor: styled(
        Primitive.ScrubAreaCursor,
        numberField.scrubAreaCursor,
    ),
};
