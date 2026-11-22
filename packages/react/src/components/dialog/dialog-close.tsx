import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { DialogContext } from "./dialog-context.ts";

/** Closes the dialog (reason `close-press`). */
export function DialogClose(props: PartProps<Record<string, never>>) {
    const context = useRequiredContext(DialogContext, "Dialog.Close");
    return renderElement(
        "button",
        props,
        {},
        {
            type: "button",
            "data-primitives-part": `${context.component}-close`,
            onClick: (event: MouseEvent) =>
                context.setOpen(false, "close-press", event.nativeEvent),
        },
    );
}
