import {
    focusInitial,
    getTabbables,
    nextTabbableAfter,
} from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { type KeyboardEvent, useEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ColorPickerPopoverContext } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

export interface ColorPickerPopoverPopupProps
    extends PartProps<ColorPickerPopoverPopupState> {}

// Closing by these returns focus to the trigger; focus leaving does not (spec/popover.md).
const RETURNS_FOCUS = new Set(["escape-key", "trigger-press"]);
// an outside press returns it only when the press focused nothing (D4 §3, Base UI), as a close
// made through the controlled `open` (`none`) or the actions (`imperative-action`) does
const RETURNS_FOCUS_UNFOCUSED = new Set([
    "outside-press",
    "none",
    "imperative-action",
]);

/**
 * The picker's non-modal dialog (spec/color-picker.md, Popover's focus and dismissal): not
 * trapped, it closes when focus leaves it; on open, its first tabbable element takes the focus.
 */
export function ColorPickerPopoverPopup(props: ColorPickerPopoverPopupProps) {
    const context = useRequiredContext(
        ColorPickerPopoverContext,
        "ColorPickerPopover.Popup",
    );
    const { open, popup, positioner, trigger, setOpen, lastReason } = context;

    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        const session = openOverlaySession(popup.ownerDocument, {
            elements: () => [positioner ?? popup],
            ignore: () => [trigger],
            dismiss: (reason, event) => setOpen(false, reason, event),
            focusOut: () => [trigger],
            returnFocus: {
                when: RETURNS_FOCUS,
                whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                reason: () => lastReason.current ?? "none",
                to: () => trigger,
            },
        });
        return session.end;
    }, [open, popup, positioner, trigger, setOpen, lastReason]);

    // on open: the first tabbable element, else the popup (D4 §3 "Popover focus on open")
    useEffect(() => {
        if (open && popup !== null) {
            focusInitial(popup, undefined);
        }
    }, [open, popup]);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab" || popup === null || event.defaultPrevented) {
            return;
        }
        // in the tab order, the popup's content comes right after the trigger (as popover.md)
        const tabbables = getTabbables(popup);
        const active = popup.ownerDocument.activeElement;
        const first = tabbables[0] ?? popup;
        const last = tabbables.at(-1) ?? popup;
        if (event.shiftKey && (active === first || active === popup)) {
            event.preventDefault();
            setOpen(false, "focus-out", event.nativeEvent);
            trigger?.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            const next = trigger
                ? nextTabbableAfter(trigger, [positioner, popup])
                : null;
            setOpen(false, "focus-out", event.nativeEvent);
            next?.focus();
        }
    };

    const status = context.presence.status;
    return renderElement(
        "div",
        props,
        { open, ...context.placed },
        {
            id: context.popupId,
            role: "dialog",
            tabIndex: -1,
            "data-primitives-part": "color-picker-popover-popup",
            ...stateAttributes({
                open,
                closed: !open,
                side: context.placed.side,
                align: context.placed.align,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
            onKeyDown,
        },
        context.setPopup,
    );
}
