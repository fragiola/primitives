import { Meter as Primitive } from "@fragiola/primitives-vue/meter";
import { meter } from "examples-shared/recipes/meter";
import { defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

/** The styled track, with its indicator. */
const Track = defineComponent({
    name: "StyledMeterTrack",
    inheritAttrs: false,
    setup(_, { attrs }) {
        return () =>
            h(Primitive.Track, mergeProps({ class: meter.track }, attrs), {
                default: () => [
                    h(Primitive.Indicator, { class: meter.indicator }),
                ],
            });
    },
});

export const Meter = {
    Root: styled(Primitive.Root, meter.root),
    Label: styled(Primitive.Label, meter.label),
    Value: styled(Primitive.Value, meter.value),
    Track,
};
