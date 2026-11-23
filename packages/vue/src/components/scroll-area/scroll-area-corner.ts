import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { ScrollAreaKey } from "./scroll-area-context.ts";

/** A Corner has no state of its own (spec/scroll-area.md). */
export type ScrollAreaCornerState = Record<string, never>;

const STATE: ScrollAreaCornerState = {};

/**
 * The square where the two scrollbars meet (spec/scroll-area.md): rendered while both axes
 * overflow, sized by the Root's `--scroll-area-corner-*` variables.
 */
export const ScrollAreaCorner: PartComponent<
    Record<never, never>,
    ScrollAreaCornerState
> = publicComponent(
    defineComponent({
        name: "ScrollAreaCorner",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                ScrollAreaKey,
                "ScrollArea.Corner",
            );
            return () => {
                const measured = context.measured.value;
                if (!(measured.hasOverflowX && measured.hasOverflowY)) {
                    return null;
                }
                return renderPart("div", { attrs, slots }, props.as, STATE, {
                    "aria-hidden": "true",
                    style: {
                        position: "absolute",
                        bottom: 0,
                        insetInlineEnd: 0,
                        width: "var(--scroll-area-corner-width)",
                        height: "var(--scroll-area-corner-height)",
                    },
                    "data-primitives-part": "scroll-area-corner",
                });
            };
        },
    }),
);
