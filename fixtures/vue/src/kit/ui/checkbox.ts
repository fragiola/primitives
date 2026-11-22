import { Checkbox as Primitive } from "@fragiola/primitives-vue/checkbox";
import { CheckboxGroup as PrimitiveGroup } from "@fragiola/primitives-vue/checkbox-group";
import { checkbox, checkboxGroup } from "examples-shared/recipes/checkbox";
import { defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

/** The styled checkbox, with its indicator: a check, or a dash while mixed. */
const Root = defineComponent({
    name: "StyledCheckbox",
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
        return () =>
            h(Primitive.Root, mergeProps({ class: checkbox.root }, attrs), {
                default:
                    slots.default ??
                    (() =>
                        h(
                            Primitive.Indicator,
                            { class: checkbox.indicator },
                            {
                                default: ({
                                    state,
                                }: {
                                    state: { indeterminate: boolean };
                                }) => (state.indeterminate ? "–" : "✓"),
                            },
                        )),
            });
    },
});

export const Checkbox = { Root };

export const CheckboxGroup = styled(PrimitiveGroup, checkboxGroup.root);
