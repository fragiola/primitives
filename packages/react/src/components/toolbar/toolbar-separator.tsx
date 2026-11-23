import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToolbarContext } from "./toolbar-context.ts";

export interface ToolbarSeparatorState {
    /** Across the toolbar's: `"vertical"` in a horizontal toolbar. */
    orientation: "horizontal" | "vertical";
}

export type ToolbarSeparatorProps = PartProps<ToolbarSeparatorState>;

/** A separator across a toolbar's orientation (spec/toolbar.md), not focusable. */
export function ToolbarSeparator(props: ToolbarSeparatorProps) {
    const toolbar = useRequiredContext(ToolbarContext, "Toolbar.Separator");
    const orientation =
        toolbar.orientation === "horizontal" ? "vertical" : "horizontal";
    return renderElement(
        "div",
        props,
        { orientation },
        {
            role: "separator",
            "aria-orientation": orientation,
            "data-primitives-part": "toolbar-separator",
            ...stateAttributes({ orientation }),
        },
    );
}
