import { ScrollArea as Primitive } from "@fragiola/primitives-vue/scroll-area";
import { scrollArea } from "examples-shared/recipes/scroll-area";
import { defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";

/** The styled track, with its thumb. */
const Scrollbar = defineComponent({
    name: "StyledScrollAreaScrollbar",
    inheritAttrs: false,
    setup(_, { attrs }) {
        return () =>
            h(
                Primitive.Scrollbar,
                mergeProps({ class: scrollArea.scrollbar }, attrs),
                {
                    default: () => [
                        h(Primitive.Thumb, { class: scrollArea.thumb }),
                    ],
                },
            );
    },
});

export const ScrollArea = {
    Root: styled(Primitive.Root, scrollArea.root),
    Viewport: styled(Primitive.Viewport, scrollArea.viewport),
    Content: styled(Primitive.Content, scrollArea.content),
    Scrollbar,
    Corner: styled(Primitive.Corner, scrollArea.corner),
};
