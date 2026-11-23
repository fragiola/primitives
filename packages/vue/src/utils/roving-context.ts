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
    /** The item holding the tab stop (`tabindex="0"`); `null` before the items are known. */
    tabStop: () => HTMLElement | null;
    /** Registers an item; `focusable`: it can take focus (not disabled, or focusable when disabled). */
    register: (element: HTMLElement, focusable: () => boolean) => () => void;
    /** An item took focus: it holds the tab stop now. */
    focused: (element: HTMLElement) => void;
}

export const RovingKey: InjectionKey<RovingScope> = Symbol("RovingScope");
