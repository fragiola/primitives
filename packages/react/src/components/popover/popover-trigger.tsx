import { getTabbables } from "@fragiola/primitives/focus";
import type { KeyboardEvent, MouseEvent } from "react";
import {
    type OverlayTriggerProps,
    useOverlayTrigger,
} from "../../hooks/use-overlay-trigger.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { PopoverContext } from "./popover-context.ts";
import type { PopoverHandle } from "./popover-handle.ts";

export interface PopoverTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface PopoverTriggerProps<Payload = unknown>
    extends PartProps<PopoverTriggerState>,
        OverlayTriggerProps<PopoverHandle<Payload>, Payload> {
    disabled?: boolean;
}

/**
 * Toggles the popover and anchors it; with a `handle`, from anywhere in the page. While open, Tab
 * from the active trigger enters the popup (spec/popover.md).
 */
export function PopoverTrigger<Payload = unknown>({
    disabled = false,
    handle,
    payload,
    id: idProp,
    ...props
}: PopoverTriggerProps<Payload>) {
    const { root, id, ref, active } = useOverlayTrigger(
        PopoverContext,
        "Popover.Trigger",
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
            "data-primitives-part": "popover-trigger",
            ...stateAttributes({ "popup-open": active, disabled }),
            onClick: (event: MouseEvent<HTMLElement>) =>
                root?.setOpen(
                    !active,
                    "trigger-press",
                    event.nativeEvent,
                    event.currentTarget,
                ),
            onKeyDown: (event: KeyboardEvent) => {
                if (
                    event.key === "Tab" &&
                    !event.shiftKey &&
                    active &&
                    root?.popup
                ) {
                    event.preventDefault();
                    (getTabbables(root.popup)[0] ?? root.popup).focus();
                }
            },
        },
        ref,
    );
}
