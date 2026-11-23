import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    ClipboardContext,
    type ClipboardState,
    clipboardState,
} from "./clipboard-context.ts";

export type ClipboardTriggerProps = PartProps<ClipboardState>;

/** The button that copies the Root's value (spec/clipboard.md). */
export function ClipboardTrigger(props: ClipboardTriggerProps) {
    const context = useRequiredContext(ClipboardContext, "Clipboard.Trigger");
    return renderElement("button", props, clipboardState(context), {
        type: "button",
        "data-primitives-part": "clipboard-trigger",
        ...context.attributes,
        onClick: (event: MouseEvent) => context.copy(event.nativeEvent),
    });
}
