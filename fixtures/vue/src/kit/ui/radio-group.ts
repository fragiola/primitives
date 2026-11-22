import { Radio as Primitive } from "@fragiola/primitives-vue/radio";
import { RadioGroup as PrimitiveGroup } from "@fragiola/primitives-vue/radio-group";
import { radio, radioGroup } from "examples-shared/recipes/radio-group";
import { type Component, defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

export const RadioGroup = styled(PrimitiveGroup, radioGroup.root);

/** The styled radio, with its dot. */
const Root = defineComponent({
    name: "StyledRadio",
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
        return () =>
            // its `value` is among the attributes
            h(
                Primitive.Root as Component,
                mergeProps({ class: radio.root }, attrs),
                {
                    default:
                        slots.default ??
                        (() =>
                            h(Primitive.Indicator, { class: radio.indicator })),
                },
            );
    },
});

export const Radio = { Root };
