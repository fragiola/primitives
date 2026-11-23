import { SegmentedControl as Primitive } from "@fragiola/primitives-vue/segmented-control";
import { segmentedControl } from "examples-shared/recipes/segmented-control";
import { type Component, defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

/** The styled Item, its label in an ItemText. */
const Item = defineComponent({
    name: "StyledSegmentedControlItem",
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
        return () =>
            // its `value` is among the attributes
            h(
                Primitive.Item as Component,
                mergeProps({ class: segmentedControl.item }, attrs),
                {
                    default: () => [
                        h(
                            Primitive.ItemText,
                            { class: segmentedControl["item-text"] },
                            { default: () => slots.default?.() },
                        ),
                    ],
                },
            );
    },
});

export const SegmentedControl = {
    Root: styled(Primitive.Root, segmentedControl.root),
    Item,
    Indicator: styled(Primitive.Indicator, segmentedControl.indicator),
};
