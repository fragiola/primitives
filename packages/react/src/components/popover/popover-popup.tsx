import {
    focusInitial,
    getTabbables,
    nextTabbableAfter,
} from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { type KeyboardEvent, useEffect, useRef } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import {
    type FocusTarget,
    resolveFocusTarget,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { PopoverContext } from "./popover-context.ts";

export interface PopoverPopupState {
    open: boolean;
    side: string;
    align: string;
}

export interface PopoverPopupProps extends PartProps<PopoverPopupState> {
    /** Focused on open (default: the first tabbable element, else the popup; `false`: none). */
    initialFocus?: FocusTarget;
    /** Focused when focus returns on close (default: the trigger). */
    finalFocus?: FocusTarget;
}

// Closing by these returns focus to the trigger; focus leaving does not (spec/popover.md).
const RETURNS_FOCUS = new Set(["escape-key", "close-press", "trigger-press"]);
// an outside press returns it only when the press focused nothing (D4 §3, Base UI); so does a
// close made through the controlled `open` (reason `none`): focus left inside the popup goes back
const RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press", "none"]);

/** The non-modal popover (spec/popover.md): not trapped, it closes when focus leaves it. */
export function PopoverPopup({
    initialFocus,
    finalFocus,
    ...props
}: PopoverPopupProps) {
    const context = useRequiredContext(PopoverContext, "Popover.Popup");
    const { open, popup, positioner, trigger, setOpen, lastReason } = context;
    const focusTargets = useRef({ initialFocus, finalFocus });
    focusTargets.current = { initialFocus, finalFocus };

    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        const session = openOverlaySession(popup.ownerDocument, {
            elements: () => [positioner ?? popup],
            ignore: () => [trigger],
            dismiss: (reason) => setOpen(false, reason),
            focusOut: () => [trigger],
            returnFocus: {
                when: RETURNS_FOCUS,
                whenUnfocused: RETURNS_FOCUS_UNFOCUSED,
                reason: () => lastReason.current ?? "none",
                to: () => {
                    const final = resolveFocusTarget(
                        focusTargets.current.finalFocus,
                    );
                    return final === false ? false : (final ?? trigger);
                },
            },
        });
        const initial = resolveFocusTarget(focusTargets.current.initialFocus);
        if (initial !== false) {
            // the first tabbable element, else the popup (D4 §3 "Popover focus on open")
            focusInitial(popup, initial);
        }
        return session.end;
    }, [open, popup, positioner, trigger, setOpen, lastReason]);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab" || popup === null || event.defaultPrevented) {
            return;
        }
        // in the tab order, the popup's content comes right after the trigger
        const tabbables = getTabbables(popup);
        const active = popup.ownerDocument.activeElement;
        const first = tabbables[0] ?? popup;
        const last = tabbables.at(-1) ?? popup;
        if (event.shiftKey && (active === first || active === popup)) {
            event.preventDefault();
            setOpen(false, "focus-out");
            trigger?.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            const next = trigger
                ? nextTabbableAfter(trigger, [positioner, popup])
                : null;
            setOpen(false, "focus-out");
            next?.focus();
        }
    };

    const status = context.presence.status;
    const state = { open, ...context.placed };
    return renderElement(
        "div",
        props,
        state,
        {
            id: context.popupId,
            role: "dialog",
            "aria-labelledby": context.titleId,
            "aria-describedby": context.descriptionId,
            tabIndex: -1,
            "data-primitives-part": "popover-popup",
            ...stateAttributes({
                open,
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
