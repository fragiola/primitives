import { openOverlaySession } from "@fragiola/primitives/overlay";
import { type FocusEvent, useEffect, useRef } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { HoverCardContext } from "./hover-card-context.ts";

export interface HoverCardPopupState {
    open: boolean;
    side: string;
    align: string;
    instant: boolean;
}

/**
 * The card (spec/hover-card.md): a non-modal layer (Escape, an outside press), which never takes
 * focus on open and closes when focus leaves it.
 */
export function HoverCardPopup(props: PartProps<HoverCardPopupState>) {
    const context = useRequiredContext(HoverCardContext, "HoverCard.Popup");
    const { open, instant, placed, popup, positioner, setOpen } = context;
    // read when the layer needs them: the active trigger may move while it is open
    const latest = useRef(context);
    latest.current = context;

    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        const session = openOverlaySession(popup.ownerDocument, {
            elements: () => [positioner ?? popup],
            ignore: () => latest.current.triggers,
            dismiss: (reason, event) => setOpen(false, reason, event),
        });
        return session.end;
    }, [open, popup, positioner, setOpen]);

    const onBlur = (event: FocusEvent) => {
        const next = event.relatedTarget;
        if (
            !open ||
            !(next instanceof Node) ||
            popup?.contains(next) ||
            positioner?.contains(next) ||
            latest.current.triggers.some((trigger) => trigger.contains(next))
        ) {
            return;
        }
        setOpen(false, "focus-out", event.nativeEvent);
    };

    const status = context.presence.status;
    return renderElement(
        "div",
        props,
        { open, instant, ...placed },
        {
            id: context.popupId,
            tabIndex: -1,
            "data-primitives-part": "hover-card-popup",
            ...stateAttributes({
                open,
                closed: !open,
                side: placed.side,
                align: placed.align,
                instant,
                "starting-style": status === "starting",
                "ending-style": status === "ending",
            }),
            onBlur,
        },
        context.setPopup,
    );
}
