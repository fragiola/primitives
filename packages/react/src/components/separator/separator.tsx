import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";

export interface SeparatorState {
    orientation: "horizontal" | "vertical";
    decorative: boolean;
}

export interface SeparatorProps extends PartProps<SeparatorState> {
    orientation?: "horizontal" | "vertical";
    /** Hidden from assistive technologies (`role="none"`). */
    decorative?: boolean;
}

/** A divider between sections or groups (spec/separator.md, the ARIA separator, not focusable). */
export function Separator({
    orientation = "horizontal",
    decorative = false,
    ...props
}: SeparatorProps) {
    return renderElement(
        "div",
        props,
        { orientation, decorative },
        {
            role: decorative ? "none" : "separator",
            "aria-orientation": decorative ? undefined : orientation,
            "data-primitives-part": "separator-root",
            ...stateAttributes({ orientation }),
        },
    );
}
