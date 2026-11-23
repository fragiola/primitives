import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    overflowAttributes,
    ScrollAreaKey,
    type ScrollAreaState,
    scrollAreaState,
} from "./scroll-area-context.ts";
import { useScrollAreaPart } from "./use-scroll-area-part.ts";

/** The scrolled content, measured when it resizes (spec/scroll-area.md). */
export const ScrollAreaContent: PartComponent<
    Record<never, never>,
    ScrollAreaState
> = publicComponent(
    defineComponent({
        name: "ScrollAreaContent",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ScrollAreaKey,
                "ScrollArea.Content",
            );
            const ref = useScrollAreaPart(() => "content", context.setPart);
            return () => {
                const state = scrollAreaState(context.measured.value);
                return renderPart("div", { attrs, slots }, props.as, state, {
                    role: "presentation",
                    style: { minWidth: "fit-content" },
                    "data-primitives-part": "scroll-area-content",
                    ...stateAttributes({
                        scrolling: state.scrolling,
                        ...overflowAttributes(state),
                    }),
                    ref,
                });
            };
        },
    }),
);
