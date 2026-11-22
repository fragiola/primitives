import { Progress as Primitive } from "@fragiola/primitives-vue/progress";
import { progress } from "examples-shared/recipes/progress";
import { defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

/** The styled track, with its indicator. */
const Track = defineComponent({
    name: "StyledProgressTrack",
    inheritAttrs: false,
    setup(_, { attrs }) {
        return () =>
            h(Primitive.Track, mergeProps({ class: progress.track }, attrs), {
                default: () => [
                    h(Primitive.Indicator, { class: progress.indicator }),
                ],
            });
    },
});

export const Progress = {
    Root: styled(Primitive.Root, progress.root),
    Label: styled(Primitive.Label, progress.label),
    Value: styled(Primitive.Value, progress.value),
    Track,
};
