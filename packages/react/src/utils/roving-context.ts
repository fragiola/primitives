import type { RovingOrientation } from "@fragiola/primitives/collection";
import { createContext } from "react";

/**
 * A roving-focus scope (spec/toolbar.md, "Nested composites"): provided by a Toolbar.Root, or by a
 * ToggleGroup with none around it; every item inside registers with the nearest one. It lives in
 * the package's shared code, so no component entry imports another's for it (D8).
 */
export interface RovingScope {
    orientation: RovingOrientation;
    /** The scope disables its items (a disabled Toolbar.Root or Toolbar.Group). */
    disabled: boolean;
    /**
     * The scope's root element (`null` before it mounts, on a server): only an element inside it
     * is one of its items ("Nested composites", 6).
     */
    root: HTMLElement | null;
    /** The item holding the tab stop (`tabindex="0"`); `null` before the items are known. */
    tabStop: HTMLElement | null;
    /** Registers an item; `focusable`: it can take focus (not disabled, or focusable when disabled). */
    register: (element: HTMLElement, focusable: boolean) => () => void;
    /** An item took focus: it holds the tab stop now. */
    focused: (element: HTMLElement) => void;
}

export const RovingContext = createContext<RovingScope | null>(null);

/**
 * The scope an element is in: `scope`, unless the element is outside the scope's root (a Toggle in
 * a popup that a portal renders from a Toolbar's item: the context passes through the portal, the
 * element is elsewhere), then `null`. While either element is unknown (a server render, the first
 * render), the element is taken as inside, so the server's output does not change.
 */
export function scopeOfElement(
    scope: RovingScope | null,
    element: HTMLElement | null,
): RovingScope | null {
    if (scope === null || element === null || scope.root === null) {
        return scope;
    }
    return scope.root.contains(element) ? scope : null;
}
