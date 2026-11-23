import type { RovingOrientation } from "@fragiola/primitives/collection";
import type { InjectionKey } from "vue";

/**
 * A roving-focus scope (spec/toolbar.md, "Nested composites"): provided by a Toolbar.Root, or by a
 * ToggleGroup with none around it; every item inside registers with the nearest one. It lives in
 * the package's shared code, so no component entry imports another's for it (D8).
 */
export interface RovingScope {
    orientation: () => RovingOrientation;
    /** The scope disables its items (a disabled Toolbar.Root or Toolbar.Group). */
    disabled: () => boolean;
    /**
     * The scope's root element (`null` before it mounts, on a server): only an element inside it
     * is one of its items ("Nested composites", 6).
     */
    root: () => HTMLElement | null;
    /** The item holding the tab stop (`tabindex="0"`); `null` before the items are known. */
    tabStop: () => HTMLElement | null;
    /** Registers an item; `focusable`: it can take focus (not disabled, or focusable when disabled). */
    register: (element: HTMLElement, focusable: () => boolean) => () => void;
    /** An item took focus: it holds the tab stop now. */
    focused: (element: HTMLElement) => void;
}

export const RovingKey: InjectionKey<RovingScope> = Symbol("RovingScope");

/**
 * The scope an element is in: `scope`, unless the element is outside the scope's root (a Toggle in
 * a popup that a Teleport renders from a Toolbar's item: `inject` passes through the Teleport, the
 * element is elsewhere), then `null`. While either element is unknown (a server render, before
 * the mount), the element is taken as inside, so the server's output does not change. Reactive
 * through the scope's `root`.
 */
export function scopeOfElement(
    scope: RovingScope | null,
    element: HTMLElement | null,
): RovingScope | null {
    const root = scope?.root() ?? null;
    if (scope === null || element === null || root === null) {
        return scope;
    }
    return root.contains(element) ? scope : null;
}

/**
 * A scope that forwards every field to `current()`'s (a ToggleGroup's: the Toolbar's around it,
 * or its own once it is known to be outside the toolbar's element). Its `root` changes with
 * `current`, so its items register again with the scope they are now in.
 */
export function forwardingScope(current: () => RovingScope): RovingScope {
    return {
        orientation: () => current().orientation(),
        disabled: () => current().disabled(),
        root: () => current().root(),
        tabStop: () => current().tabStop(),
        register: (element, focusable) =>
            current().register(element, focusable),
        focused: (element) => current().focused(element),
    };
}
