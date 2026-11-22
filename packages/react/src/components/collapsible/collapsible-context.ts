import { createContext } from "react";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface CollapsibleState {
    open: boolean;
    disabled: boolean;
}

export interface CollapsibleContextValue extends CollapsibleState {
    setOpen: (open: boolean, reason: ChangeReason) => void;
    panelId: string;
}

export const CollapsibleContext = createContext<CollapsibleContextValue | null>(
    null,
);

/** `data-open` / `data-closed` (exactly one) and `data-disabled` (spec/collapsible.md). */
export function collapsibleAttributes(state: CollapsibleState) {
    return {
        open: state.open,
        closed: !state.open,
        disabled: state.disabled,
    };
}
