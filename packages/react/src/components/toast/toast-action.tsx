import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastRootContext } from "./toast-context.ts";

/** A toast's action: a button the app wires (spec/toast.md). */
export function ToastAction(props: PartProps<{ type: string | undefined }>) {
    const context = useRequiredContext(ToastRootContext, "Toast.Action");
    return renderElement(
        "button",
        props,
        { type: context.toast.type },
        {
            type: "button",
            "data-primitives-part": "toast-action",
            ...stateAttributes({ type: context.toast.type }),
        },
    );
}
