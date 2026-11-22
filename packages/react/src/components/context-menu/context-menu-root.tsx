import {
    type VirtualAnchor,
    virtualAnchor,
} from "@fragiola/primitives/positioning";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import type { OverlayRootProps } from "../../hooks/use-overlay-root.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import { MenuContext } from "../menu/menu-context.ts";
import { useMenuRoot } from "../menu/use-menu-root.ts";
import {
    ContextMenuContext,
    type ContextMenuPoint,
} from "./context-menu-context.ts";

export interface ContextMenuRootProps extends OverlayRootProps {
    /** Arrow keys wrap at the ends (default `true`). */
    loopFocus?: boolean;
    /**
     * Locks the page's scroll and blocks the pointer outside the menu while it is open (default
     * `false`; spec/menu.md, "Modal").
     */
    modal?: boolean;
    /** The area opens nothing, and the browser's own menu shows (default `false`). */
    disabled?: boolean;
    children?: ReactNode;
}

/** An element focus may return to: still in the document, and not disabled. */
function focusable(element: HTMLElement | null): HTMLElement | null {
    return element?.isConnected === true && !element.matches(":disabled")
        ? element
        : null;
}

/**
 * Holds the state of a context menu's root level; renders no element (spec/context-menu.md). Its
 * parts are Menu's, named `context-menu-*`; its Trigger is an area.
 */
export function ContextMenuRoot({
    disabled = false,
    children,
    ...props
}: ContextMenuRootProps) {
    const [anchor, setAnchor] = useState<Element | VirtualAnchor | null>(null);
    // the element that had focus when the menu opened: focus returns to it
    const opener = useRef<HTMLElement | null>(null);
    const returnTarget = useCallback(() => focusable(opener.current), []);
    const menu = useMenuRoot(props, false, {
        component: "context-menu",
        anchor,
        returnTarget,
    });
    const latest = useRef(menu);
    latest.current = menu;
    const openAt = useCallback(
        (
            at: ContextMenuPoint | Element,
            reason: ChangeReason,
            event: Event,
            area: HTMLElement,
            highlight: "first" | null,
        ) => {
            const current = latest.current;
            const doc = area.ownerDocument;
            const active = doc.activeElement;
            // focus left in the menu itself (a press while open) keeps the opener it had
            if (!current.positioner?.contains(active)) {
                opener.current =
                    active instanceof HTMLElement && active !== doc.body
                        ? active
                        : null;
            }
            setAnchor(at instanceof Element ? at : virtualAnchor(at, area));
            current.pendingHighlight.current = highlight;
            if (!current.setOpen(true, reason, event, area)) {
                current.pendingHighlight.current = null;
            }
        },
        [],
    );
    const context = useMemo(() => ({ disabled, openAt }), [disabled, openAt]);
    return (
        <ContextMenuContext.Provider value={context}>
            <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
        </ContextMenuContext.Provider>
    );
}
