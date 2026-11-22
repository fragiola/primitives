import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

/** A point in the viewport's (client) coordinates. */
export interface ContextMenuPoint {
    x: number;
    y: number;
}

/** What a ContextMenu's Root gives its Trigger area (spec/context-menu.md). */
export interface ContextMenuContextValue {
    disabled: boolean;
    /**
     * Opens the menu at a point (a right-click, a long press) or anchored to an element (the
     * keyboard), from the Trigger area, highlighting the first item or none.
     */
    openAt: (
        at: ContextMenuPoint | Element,
        reason: ChangeReason,
        event: Event,
        area: HTMLElement,
        highlight: "first" | null,
    ) => void;
}

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(
    null,
);
