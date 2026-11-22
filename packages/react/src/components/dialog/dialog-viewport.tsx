import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogContext, nestedName } from "./dialog-context.ts";

export interface DialogViewportState {
    open: boolean;
    nested: boolean;
    nestedDialogOpen: boolean;
}

/**
 * The container the popup sits in, covering the page (spec/dialog.md, "Anatomy"): a press on it
 * outside the popup is an outside press.
 */
export function DialogViewport(props: PartProps<DialogViewportState>) {
    const context = useRequiredContext(DialogContext, "Dialog.Viewport");
    const { open, nested, nestedDialogs, presence } = context;
    const status = presence.status;
    const nestedDialogOpen = nestedDialogs > 0;
    return renderElement(
        "div",
        props,
        { open, nested, nestedDialogOpen },
        {
            role: "presentation",
            hidden: presence.mounted ? undefined : true,
            "data-primitives-part": `${context.component}-viewport`,
            ...stateAttributes({
                open,
                closed: !open,
                nested,
                [`nested-${nestedName(context.component)}-open`]:
                    nestedDialogOpen,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
        },
        context.setViewport,
    );
}
