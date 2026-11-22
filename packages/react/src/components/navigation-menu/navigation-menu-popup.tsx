import { getTabbables, nextTabbableAfter } from "@fragiola/primitives/focus";
import { openOverlaySession } from "@fragiola/primitives/overlay";
import { isInHoverBridge } from "@fragiola/primitives/pointer";
import {
    type CSSProperties,
    type KeyboardEvent,
    useEffect,
    useRef,
} from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { NavigationMenuContext } from "./navigation-menu-context.ts";

export interface NavigationMenuPopupState {
    open: boolean;
    side: string;
    align: string;
}

const RETURNS_FOCUS = new Set(["escape-key"]);

/**
 * The shared popup (spec/navigation-menu.md): a non-modal layer of the overlay tree while a
 * Content is open, sized by the open Content (`--popup-width`, `--popup-height`); the pointer
 * leaving it and the Trigger closes a hover-opened Content after the close delay.
 */
export function NavigationMenuPopup({
    style,
    ...props
}: PartProps<NavigationMenuPopupState>) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Popup",
    );
    const { popup, positioner, setValue, lastReason, hover } = context;
    const open = context.value !== null;
    // read when the session needs them: the open item may switch while it is open
    const latest = useRef(context);
    latest.current = context;
    const session = useRef<{ elementsAbove: () => Element[] } | null>(null);

    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        const doc = popup.ownerDocument;
        const layer = openOverlaySession(doc, {
            elements: () => [positioner ?? popup],
            // a press on the Root's List is its own (a Trigger toggles or switches)
            ignore: () => [latest.current.root],
            owner: () => [latest.current.activeTrigger],
            dismiss: (reason, event) => setValue(null, reason, event),
            focusOut: () => [latest.current.root],
            returnFocus: {
                when: RETURNS_FOCUS,
                reason: () => lastReason.current ?? "none",
                // only when focus was inside the popup (APG: the button keeps its focus)
                to: () =>
                    (positioner ?? popup).contains(doc.activeElement)
                        ? latest.current.activeTrigger
                        : false,
            },
        });
        session.current = layer;
        return () => {
            session.current = null;
            layer.end();
        };
    }, [open, popup, positioner, setValue, lastReason]);

    // a hover-opened Content: the pointer leaving the Trigger and the popup (and the levels
    // opened from it) closes it after the close delay
    useEffect(() => {
        if (!open || popup === null) {
            return undefined;
        }
        const doc = popup.ownerDocument;
        const onMove = (event: PointerEvent) => {
            const current = latest.current;
            const trigger = current.activeTrigger;
            if (
                event.pointerType === "touch" ||
                current.openedBy.current.by !== "hover" ||
                trigger === null
            ) {
                return;
            }
            const target = event.target;
            const point = { x: event.clientX, y: event.clientY };
            const inside =
                isInHoverBridge(point, trigger, positioner ?? popup) ||
                (target instanceof Node &&
                    (session.current?.elementsAbove() ?? []).some((element) =>
                        element.contains(target),
                    ));
            if (inside) {
                hover.cancel();
            } else {
                hover.leave(current.closeDelay);
            }
        };
        doc.addEventListener("pointermove", onMove);
        return () => doc.removeEventListener("pointermove", onMove);
    }, [open, popup, positioner, hover]);

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const trigger = context.activeTrigger;
        if (
            event.key !== "Tab" ||
            popup === null ||
            trigger === null ||
            event.defaultPrevented ||
            // a nested level's popup is its own (its portal bubbles here in React)
            !popup.contains(event.target as Node)
        ) {
            return;
        }
        const tabbables = getTabbables(popup);
        const active = popup.ownerDocument.activeElement;
        if (event.shiftKey && active === tabbables[0]) {
            event.preventDefault();
            trigger.focus();
        } else if (!event.shiftKey && active === tabbables.at(-1)) {
            // in the tab order, the Content comes right after its Trigger
            const next = nextTabbableAfter(trigger, [positioner, popup]);
            if (next) {
                event.preventDefault();
                next.focus();
            }
        }
    };

    const status = context.presence.status;
    const state = { open, ...context.placed };
    const resolvedStyle = typeof style === "function" ? style(state) : style;
    const { size } = context;
    return renderElement(
        "div",
        {
            ...props,
            style: {
                ...(size
                    ? {
                          "--popup-width": `${size.width}px`,
                          "--popup-height": `${size.height}px`,
                      }
                    : {}),
                ...resolvedStyle,
            } as CSSProperties,
        },
        state,
        {
            "data-primitives-part": "navigation-menu-popup",
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
