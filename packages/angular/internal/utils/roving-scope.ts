import { computed, InjectionToken, type Signal } from "@angular/core";
import type { RovingOrientation } from "@fragiola/primitives/collection";

/**
 * A roving-focus scope (spec/toolbar.md, "Nested composites"): provided by a `[toolbarRoot]`, or by
 * a `[toggleGroup]` with none around it, and passed on by a `[toolbarGroup]` with its `disabled`;
 * every item inside (a Toolbar's Button, Link and Input, a Toggle) registers with the nearest one.
 * It lives in the package's shared code, so no component entry imports another's for it (D8).
 */
export interface RovingScope {
    readonly orientation: Signal<RovingOrientation>;
    /** The scope disables its items (a disabled Toolbar.Root or Toolbar.Group). */
    readonly disabled: Signal<boolean>;
    /** The scope's root element: only an element inside it is one of its items ("Nested composites", 6). */
    readonly root: Signal<HTMLElement>;
    /** The item holding the tab stop (`tabindex="0"`); `null` before the items are known. */
    readonly tabStop: Signal<HTMLElement | null>;
    /**
     * Registers an item, and returns its cleanup; `focusable`: it can take focus (not disabled,
     * or focusable when disabled), read when the tab stop or a key needs it.
     */
    register: (element: HTMLElement, focusable: () => boolean) => () => void;
    /** An item took focus: it holds the tab stop now. */
    focused: (element: HTMLElement) => void;
    /**
     * The composite's key handler, on its root's `keydown`; an item whose own handlers a disabled
     * guard stopped (a focusable disabled Toolbar.Button) hands it the composite's keys.
     */
    keydown: (event: KeyboardEvent) => void;
}

export const ROVING_SCOPE = new InjectionToken<RovingScope>("RovingScope");

/**
 * The scope an element is in: `scope`, unless the element is outside the scope's root (a Toggle in
 * a popup that a portal renders from a Toolbar's item: the portal's view keeps its declaration's
 * injector, the element is elsewhere), then `null`. Before the element is rendered (`rendered`
 * false: a server render, the first render) it is taken as inside, so the server's output does not
 * change. Reactive through `rendered` and the scope's `root`.
 */
export function scopeOfElement(
    scope: RovingScope | null,
    element: HTMLElement,
    rendered: boolean,
): RovingScope | null {
    if (scope === null || !rendered) {
        return scope;
    }
    return scope.root().contains(element) ? scope : null;
}

/**
 * A scope that forwards every field to `current()`'s (a ToggleGroup's: the Toolbar's around it,
 * or its own once it is known to be outside the toolbar's element). Its `root` changes with
 * `current`, so its items register again with the scope they are now in.
 */
export function forwardingScope(current: () => RovingScope): RovingScope {
    return {
        orientation: computed(() => current().orientation()),
        disabled: computed(() => current().disabled()),
        root: computed(() => current().root()),
        tabStop: computed(() => current().tabStop()),
        register: (element, focusable) =>
            current().register(element, focusable),
        focused: (element) => current().focused(element),
        keydown: (event) => current().keydown(event),
    };
}
