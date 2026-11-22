import { Switch as Primitive } from "@fragiola/primitives-vue/switch";
import { switchControl } from "examples-shared/recipes/switch";
import { defineComponent, h, mergeProps } from "vue";

/** The styled switch, with its thumb. */
const Root = defineComponent({
    name: "StyledSwitch",
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
        return () =>
            h(
                Primitive.Root,
                mergeProps({ class: switchControl.root }, attrs),
                {
                    default:
                        slots.default ??
                        (() =>
                            h(Primitive.Thumb, { class: switchControl.thumb })),
                },
            );
    },
});

export const Switch = { Root };
