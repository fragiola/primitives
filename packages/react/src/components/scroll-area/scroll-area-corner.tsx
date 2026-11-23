import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { ScrollAreaContext } from "./scroll-area-context.ts";

/** A Corner has no state of its own (spec/scroll-area.md). */
export type ScrollAreaCornerState = Record<string, never>;

export type ScrollAreaCornerProps = PartProps<ScrollAreaCornerState>;

const STATE: ScrollAreaCornerState = {};

/**
 * The square where the two scrollbars meet (spec/scroll-area.md): rendered while both axes
 * overflow, sized by the Root's `--scroll-area-corner-*` variables.
 */
export function ScrollAreaCorner(props: ScrollAreaCornerProps) {
    const { measured } = useRequiredContext(
        ScrollAreaContext,
        "ScrollArea.Corner",
    );
    if (!(measured.hasOverflowX && measured.hasOverflowY)) {
        return null;
    }
    return renderElement("div", props, STATE, {
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
}
