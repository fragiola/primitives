import { getTabbables, nextTabbableAfter } from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { type KeyboardEvent, useEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DatePickerContext } from "./date-picker-context.ts";

export interface DatePickerPopupState {
    open: boolean;
    side: Side;
    align: Align;
}

export interface DatePickerPopupProps extends PartProps<DatePickerPopupState> {}

// Closing by these returns focus to the trigger; focus leaving does not (spec/calendar.md, "Focus").
const RETURNS_FOCUS = new Set(["escape-key", "item-press", "trigger-press"]);
// an outside press returns it only when the press focused nothing (as Popover, D4 §3)
// and a close made through the controlled `open` (reason `none`), as Popover's
// (and a handle's or the actions' `imperative-action`, whose focus return is `none`'s)
const RETURNS_FOCUS_UNFOCUSED = new Set([
    "outside-press",
    "none",
    "imperative-action",
]);

/** The non-modal dialog holding the bound calendar (spec/calendar.md, pickers). */
export function DatePickerPopup(props: DatePickerPopupProps) {
    const context = useRequiredContext(DatePickerContext, "DatePicker.Popup");
    const { open, popup, positioner, trigger, setOpen, lastReason } = context;

    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        // the bound calendar focuses its focused date itself (spec/calendar.md, "Focus")
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
            "data-primitives-part": `${context.component}-popup`,
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
