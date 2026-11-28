import type { MouseEvent, ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    ClipboardContext,
    type ClipboardState,
    clipboardState,
} from "./clipboard-context.ts";

export interface ClipboardTriggerProps
    extends Omit<PartProps<ClipboardState>, "children"> {
    /**
     * Nodes, or a function of the state: a visible label that follows the status ("Copy link",
     * "Copied") names the button by its content, in both states (spec/clipboard.md, "Trigger").
     */
    children?: ReactNode | ((state: ClipboardState) => ReactNode);
}

/** The button that copies the Root's value (spec/clipboard.md). */
export function ClipboardTrigger({
    children,
    ...props
}: ClipboardTriggerProps) {
    const context = useRequiredContext(ClipboardContext, "Clipboard.Trigger");
    const state = clipboardState(context);
    return renderElement(
        "button",
        {
            ...props,
            children:
                typeof children === "function" ? children(state) : children,
        },
        state,
        {
            type: "button",
            "data-primitives-part": "clipboard-trigger",
            ...context.attributes,
            onClick: (event: MouseEvent) => context.copy(event.nativeEvent),
        },
    );
}
