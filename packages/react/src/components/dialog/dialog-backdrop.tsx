import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogContext } from "./dialog-context.ts";

export interface DialogBackdropState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

export interface DialogBackdropProps extends PartProps<DialogBackdropState> {
    /** A nested dialog's Backdrop renders only with it (default `false`; spec/dialog.md). */
    forceRender?: boolean;
}

export function DialogBackdrop({
    forceRender = false,
    ...props
}: DialogBackdropProps) {
    const context = useRequiredContext(DialogContext, "Dialog.Backdrop");
    if (context.nested && !forceRender) {
        return null;
    }
    const { open, nested, nestedDialogs, presence } = context;
    const status = presence.status;
    const nestedDialogOpen = nestedDialogs > 0;
    return renderElement(
        "div",
        props,
        { open, nested, nestedDialogOpen },
        {
            "aria-hidden": "true",
            hidden: presence.mounted ? undefined : true,
            "data-primitives-part": `${context.component}-backdrop`,
            ...stateAttributes({
                open,
                closed: !open,
                nested,
                "nested-dialog-open": nestedDialogOpen,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
        },
        context.setBackdrop,
    );
}
