import type { ComputedRef, InjectionKey } from "vue";
import type { ChangeReason } from "../../utils/change-details.ts";

export interface CollapsibleState {
    open: boolean;
    disabled: boolean;
}

export interface CollapsibleContext {
    state: ComputedRef<CollapsibleState>;
    setOpen: (open: boolean, reason: ChangeReason) => void;
    panelId: string;
}

export const CollapsibleKey: InjectionKey<CollapsibleContext> =
    Symbol("Collapsible");

/** `data-open` / `data-closed` (exactly one) and `data-disabled` (spec/collapsible.md). */
export function collapsibleAttributes(state: CollapsibleState) {
    return {
        open: state.open,
        closed: !state.open,
        disabled: state.disabled,
    };
}
