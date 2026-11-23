import { Rating as Primitive } from "@fragiola/primitives-vue/rating";
import { rating } from "examples-shared/recipes/rating";
import { type Component, defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

const STAR =
    "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.5l7.1-.6z";

/** The star mark: an outline, and its fill over it (the recipe shows it by the Item's state). */
function star() {
    const mark = () =>
        h(
            "svg",
            { class: rating.star, viewBox: "0 0 24 24", "aria-hidden": "true" },
            [h("path", { d: STAR })],
        );
    return [
        mark(),
        h("span", { class: rating.fill, "aria-hidden": "true" }, [mark()]),
    ];
}

/** The styled star. */
const Item = defineComponent({
    name: "StyledRatingItem",
    inheritAttrs: false,
    setup(_, { attrs }) {
        return () =>
            // its `index` is among the attributes
            h(
                Primitive.Item as Component,
                mergeProps({ class: rating.item }, attrs),
                { default: star },
            );
    },
});

export const Rating = {
    Root: styled(Primitive.Root, rating.root),
    Item,
    HiddenInput: Primitive.HiddenInput,
};
