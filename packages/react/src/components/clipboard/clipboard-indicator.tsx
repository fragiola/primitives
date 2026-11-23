import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    ClipboardContext,
    type ClipboardState,
    clipboardState,
} from "./clipboard-context.ts";

export interface ClipboardIndicatorProps
    extends Omit<PartProps<ClipboardState>, "children"> {
    /** Nodes, or a function of the state. */
    children?: ReactNode | ((state: ClipboardState) => ReactNode);
}

/** Follows the status: the app's icons, hidden from the accessibility tree (spec/clipboard.md). */
export function ClipboardIndicator({
    children,
    ...props
}: ClipboardIndicatorProps) {
    const context = useRequiredContext(ClipboardContext, "Clipboard.Indicator");
    const state = clipboardState(context);
    return renderElement(
        "span",
        {
            ...props,
            children:
                typeof children === "function" ? children(state) : children,
        },
        state,
        {
            "aria-hidden": "true",
            "data-primitives-part": "clipboard-indicator",
            ...context.attributes,
        },
    );
}
