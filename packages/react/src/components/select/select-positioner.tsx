import { blockOutsidePointer } from "@fragiola/primitives/inert";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { lockScroll } from "@fragiola/primitives/scroll-lock";
import { useEffect, useLayoutEffect, useRef } from "react";
import {
    type PositionerProps,
    usePositioner,
} from "../../hooks/use-positioner.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { SelectContext } from "./select-context.ts";

export interface SelectPositionerState {
    open: boolean;
    side: string;
    align: string;
}

export interface SelectPositionerProps
    extends PartProps<SelectPositionerState>,
        PositionerProps {}

// a modal select's outside press reaches nothing: the press would leave focus on the body, so it
// goes back to the trigger, which keeps it (spec/select.md, "Modal")
const MODAL_RETURNS_FOCUS_UNFOCUSED = new Set(["outside-press"]);
const NEVER = new Set<string>();

/**
 * Places the list below the trigger (spec/select.md, "Item alignment"); the open list is a layer
 * (Escape, outside press).
 */
export function SelectPositioner({
    side,
    align,
    sideOffset = 4,
    alignOffset,
    collisionPadding,
    anchor,
    ...props
}: SelectPositionerProps) {
    const context = useRequiredContext(SelectContext, "Select.Positioner");
    const { open, modal, positioner, trigger, setOpen, setPlaced, lastReason } =
        context;
    const modalNow = useRef(modal);
    modalNow.current = modal;
    const placed = usePositioner(
        { side, align, sideOffset, alignOffset, collisionPadding, anchor },
        { side: "bottom", align: "start" },
        trigger,
        positioner,
        null,
        context.presence.mounted,
    );
    useLayoutEffect(() => setPlaced(placed), [placed, setPlaced]);
    useEffect(() => {
        if (!open || positioner === null) {
            return undefined;
        }
        const session = openOverlaySession(positioner.ownerDocument, {
            elements: () => [positioner],
            ignore: () => [trigger],
            dismiss: (reason, event) => setOpen(false, reason, event),
            returnFocus: {
                when: NEVER,
                whenUnfocused: () =>
                    modalNow.current
                        ? MODAL_RETURNS_FOCUS_UNFOCUSED
                        : undefined,
                reason: () => lastReason.current,
                to: () => trigger,
            },
        });
        return session.end;
    }, [open, positioner, trigger, setOpen, lastReason]);
    // spec/select.md, "Modal": the scroll lock and the outside pointer block, on their own, so
    // toggling `modal` while open keeps the session as it is
    useEffect(() => {
        if (!open || positioner === null || !modal) {
            return undefined;
        }
        const doc = positioner.ownerDocument;
        const unlock = lockScroll(doc);
        const unblock = blockOutsidePointer(doc);
        return () => {
            unblock();
            unlock();
        };
    }, [open, positioner, modal]);
    return renderElement(
        "div",
        props,
        { open, ...placed },
        {
            role: "presentation",
            hidden: context.presence.mounted ? undefined : true,
            // a modal select blocks the pointer outside; its list takes it back (spec/select.md)
            style: modal ? { pointerEvents: "auto" } : undefined,
            "data-primitives-part": "select-positioner",
            ...stateAttributes({
                open,
                closed: !open,
                side: placed.side,
                align: placed.align,
            }),
        },
        context.setPositioner,
    );
}
