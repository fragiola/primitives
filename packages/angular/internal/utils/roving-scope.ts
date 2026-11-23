import { InjectionToken, type Signal } from "@angular/core";
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
