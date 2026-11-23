import type { RovingOrientation } from "@fragiola/primitives/collection";
import { createContext } from "react";

/** What a Toolbar.Root gives its parts (spec/toolbar.md); its items register with its roving scope. */
export interface ToolbarContextValue {
    orientation: RovingOrientation;
}

export const ToolbarContext = createContext<ToolbarContextValue | null>(null);

/** The parts' state: the toolbar's orientation, and whether the part is disabled. */
export interface ToolbarItemState {
    orientation: RovingOrientation;
    disabled: boolean;
}
