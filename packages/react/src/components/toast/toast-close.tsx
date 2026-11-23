import type { MouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastRootContext } from "./toast-context.ts";

/** Closes its toast (spec/toast.md). */
export function ToastClose(props: PartProps<{ type: string | undefined }>) {
    const context = useRequiredContext(ToastRootContext, "Toast.Close");
    return renderElement(
        "button",
        props,
        { type: context.toast.type },
        {
            type: "button",
            "data-primitives-part": "toast-close",
            ...stateAttributes({ type: context.toast.type }),
            onClick: (event: MouseEvent) => {
                if (!event.defaultPrevented) {
                    context.close();
                }
            },
        },
    );
}
