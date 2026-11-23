import { createPortal } from "react-dom";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    NumberFieldContext,
    type NumberFieldState,
    numberFieldState,
} from "./number-field-context.ts";

export type NumberFieldScrubAreaCursorProps = PartProps<NumberFieldState>;

/**
 * The virtual cursor of a locked scrub (spec/number-field.md, "Pointer"), in a portal into `body`:
 * rendered only while a mouse scrubs with the pointer locked.
 */
export function NumberFieldScrubAreaCursor(
    props: NumberFieldScrubAreaCursorProps,
) {
    const context = useRequiredContext(
        NumberFieldContext,
        "NumberField.ScrubAreaCursor",
    );
    const { cursor } = context;
    if (cursor === null || typeof document === "undefined") {
        return null;
    }
    return createPortal(
        renderElement("span", props, numberFieldState(context), {
            style: {
                position: "fixed",
                top: 0,
                left: 0,
                pointerEvents: "none",
                transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
            },
            "data-primitives-part": "number-field-scrub-area-cursor",
            ...context.attributes,
        }),
        document.body,
    );
}
