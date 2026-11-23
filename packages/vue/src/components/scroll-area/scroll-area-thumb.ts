import type { ScrollAreaOrientation } from "@fragiola/primitives/scroll-area";
import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    ScrollAreaKey,
    ScrollAreaScrollbarKey,
} from "./scroll-area-context.ts";
import { useScrollAreaPart } from "./use-scroll-area-part.ts";

export interface ScrollAreaThumbState {
    /** The user scrolls its axis. */
    scrolling: boolean;
    orientation: ScrollAreaOrientation;
}

/**
 * The thumb of a Scrollbar (spec/scroll-area.md): its size is the Scrollbar's
 * `--scroll-area-thumb-*` variable, and the toolkit places it along the track.
 */
export const ScrollAreaThumb: PartComponent<
    Record<never, never>,
    ScrollAreaThumbState
> = publicComponent(
    defineComponent({
        name: "ScrollAreaThumb",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ScrollAreaKey,
                "ScrollArea.Thumb",
            );
            const orientation = useRequiredContext(
                ScrollAreaScrollbarKey,
                "ScrollArea.Thumb",
            );
            const ref = useScrollAreaPart(
                () => (orientation() === "vertical" ? "thumb-y" : "thumb-x"),
                context.setPart,
            );
            return () => {
                const current = orientation();
                const vertical = current === "vertical";
                const measured = context.measured.value;
                const scrolling = vertical
                    ? measured.scrollingY
                    : measured.scrollingX;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { scrolling, orientation: current },
                    {
                        style: vertical
                            ? { height: "var(--scroll-area-thumb-height)" }
                            : { width: "var(--scroll-area-thumb-width)" },
                        "data-primitives-part": "scroll-area-thumb",
                        "data-orientation": current,
                        ...stateAttributes({ scrolling }),
                        ref,
                    },
                );
            };
        },
    }),
);
