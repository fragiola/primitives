import type { RovingOrientation } from "@fragiola/primitives/collection";
import type { InjectionKey } from "vue";

/** What a Toolbar.Root gives its parts (spec/toolbar.md); its items register with its roving scope. */
export interface ToolbarContext {
    orientation: () => RovingOrientation;
}

export const ToolbarKey: InjectionKey<ToolbarContext> = Symbol("Toolbar");

/** The parts' state: the toolbar's orientation, and whether the part is disabled. */
export interface ToolbarItemState {
    orientation: RovingOrientation;
    disabled: boolean;
}
