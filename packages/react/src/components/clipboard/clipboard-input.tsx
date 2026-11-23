import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import {
    ClipboardContext,
    type ClipboardState,
    clipboardState,
} from "./clipboard-context.ts";

export type ClipboardInputProps = PartProps<ClipboardState>;

/** Shows the Root's value, read-only (spec/clipboard.md). */
export function ClipboardInput(props: ClipboardInputProps) {
    const context = useRequiredContext(ClipboardContext, "Clipboard.Input");
    return renderElement(
        "input",
        props,
        clipboardState(context),
        {
            type: "text",
            readOnly: true,
            value: context.value,
            "data-primitives-part": "clipboard-input",
            ...context.attributes,
        },
        (element: HTMLElement | null) =>
            context.setInputElement(element as HTMLInputElement | null),
    );
}
