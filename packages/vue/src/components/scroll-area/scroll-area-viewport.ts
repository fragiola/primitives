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

/**
 * The element that scrolls, natively (spec/scroll-area.md): its native scrollbars are hidden, and
 * it takes a tab stop while it overflows with nothing focusable in it.
 */
export const ScrollAreaViewport: PartComponent<
    Record<never, never>,
    ScrollAreaState
> = publicComponent(
    defineComponent({
        name: "ScrollAreaViewport",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ScrollAreaKey,
                "ScrollArea.Viewport",
            );
            const ref = useScrollAreaPart(() => "viewport", context.setPart);
            return () => {
                const measured = context.measured.value;
                const state = scrollAreaState(measured);
                return renderPart("div", { attrs, slots }, props.as, state, {
                    tabindex: measured.focusable ? 0 : undefined,
                    style: { overflow: "scroll", scrollbarWidth: "none" },
                    "data-primitives-part": "scroll-area-viewport",
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
