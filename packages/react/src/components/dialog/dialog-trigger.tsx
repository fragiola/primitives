import type { MouseEvent } from "react";
import {
    type OverlayTriggerProps,
    useOverlayTrigger,
} from "../../hooks/use-overlay-trigger.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogContext } from "./dialog-context.ts";
import type { DialogHandle } from "./dialog-handle.ts";

export interface DialogTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface DialogTriggerProps<Payload = unknown>
    extends PartProps<DialogTriggerState>,
        OverlayTriggerProps<DialogHandle<Payload>, Payload> {
    disabled?: boolean;
}

/** Opens the dialog; with a `handle`, from anywhere in the page (spec/dialog.md). */
export function DialogTrigger<Payload = unknown>({
    disabled = false,
    handle,
    payload,
    id: idProp,
    ...props
}: DialogTriggerProps<Payload>) {
    const { root, id, ref, active } = useOverlayTrigger(
        DialogContext,
        "Dialog.Trigger",
        { handle, payload, id: idProp },
    );
    const state = { open: active, disabled };
    return renderElement(
        "button",
        props,
        state,
        {
            type: "button",
            id,
            disabled,
            "aria-haspopup": "dialog",
            "aria-expanded": active,
            "aria-controls": active ? root?.popupId : undefined,
            "data-primitives-part": "dialog-trigger",
            ...stateAttributes({ "popup-open": active, disabled }),
            onClick: (event: MouseEvent<HTMLElement>) =>
                root?.setOpen(
                    !active,
                    "trigger-press",
                    event.nativeEvent,
                    event.currentTarget,
                ),
        },
        ref,
    );
}
