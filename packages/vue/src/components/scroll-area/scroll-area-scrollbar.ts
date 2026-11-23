import type { ScrollAreaOrientation } from "@fragiola/primitives/scroll-area";
import { defineComponent, type PropType, provide } from "vue";
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
    ScrollAreaScrollbarKey,
    type ScrollAreaState,
    scrollAreaState,
} from "./scroll-area-context.ts";
import { useScrollAreaPart } from "./use-scroll-area-part.ts";

export interface ScrollAreaScrollbarState extends ScrollAreaState {
    /** A mouse or pen is over the Root. */
    hovering: boolean;
    orientation: ScrollAreaOrientation;
}

export interface ScrollAreaScrollbarProps {
    /** Its axis (default `vertical`). */
    orientation?: ScrollAreaOrientation;
    /** Rendered even when its axis does not overflow (default `false`). */
    keepMounted?: boolean;
}

const VERTICAL = {
    top: 0,
    bottom: "var(--scroll-area-corner-height)",
    insetInlineEnd: 0,
};

const HORIZONTAL = {
    insetInlineStart: 0,
    insetInlineEnd: "var(--scroll-area-corner-width)",
    bottom: 0,
};

/**
 * The track of one axis (spec/scroll-area.md): `aria-hidden`, rendered while its axis
 * overflows; a press on it scrolls, a drag of its Thumb scrolls (the toolkit's listeners).
 */
export const ScrollAreaScrollbar: PartComponent<
    ScrollAreaScrollbarProps,
    ScrollAreaScrollbarState
> = publicComponent(
    defineComponent({
        name: "ScrollAreaScrollbar",
        inheritAttrs: false,
        props: {
            ...asProp,
            orientation: {
                type: String as PropType<ScrollAreaOrientation>,
                default: "vertical",
            },
            keepMounted: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ScrollAreaKey,
                "ScrollArea.Scrollbar",
            );
            const vertical = () => props.orientation === "vertical";
            const ref = useScrollAreaPart(
                () => (vertical() ? "scrollbar-y" : "scrollbar-x"),
                context.setPart,
            );
            provide(ScrollAreaScrollbarKey, () => props.orientation);
            return () => {
                const measured = context.measured.value;
                const shown =
                    props.keepMounted ||
                    (vertical()
                        ? measured.hasOverflowY
                        : measured.hasOverflowX);
                if (!shown) {
                    return null;
                }
                const base = scrollAreaState(measured);
                const state: ScrollAreaScrollbarState = {
                    ...base,
                    scrolling: vertical()
                        ? measured.scrollingY
                        : measured.scrollingX,
                    hovering: measured.hovering,
                    orientation: props.orientation,
                };
                return renderPart("div", { attrs, slots }, props.as, state, {
                    "aria-hidden": "true",
                    style: {
                        position: "absolute",
                        touchAction: "none",
                        userSelect: "none",
                        visibility: measured.measured ? undefined : "hidden",
                        ...(vertical() ? VERTICAL : HORIZONTAL),
                    },
                    "data-primitives-part": "scroll-area-scrollbar",
                    "data-orientation": props.orientation,
                    ...stateAttributes({
                        hovering: state.hovering,
                        scrolling: state.scrolling,
                        ...overflowAttributes(base),
                    }),
                    ref,
                });
            };
        },
    }),
);
