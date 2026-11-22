import { useCallback, useId, useMemo } from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CollapsibleContext,
    type CollapsibleState,
    collapsibleAttributes,
} from "./collapsible-context.ts";

export interface CollapsibleRootProps extends PartProps<CollapsibleState> {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean, details: ChangeDetails) => void;
    /** Nothing but a controlled `open` opens or closes it (default `false`). */
    disabled?: boolean;
}

/** spec/collapsible.md (the APG disclosure) */
export function CollapsibleRoot({
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    ...props
}: CollapsibleRootProps) {
    const [open, setOpenState] = useControllableState(
        openProp,
        defaultOpen,
        onOpenChange,
    );
    const panelId = `${useId()}-panel`;
    const setOpen = useCallback(
        (next: boolean, reason: ChangeReason) => setOpenState(next, { reason }),
        [setOpenState],
    );
    const context = useMemo(
        () => ({ open, disabled, setOpen, panelId }),
        [open, disabled, setOpen, panelId],
    );
    const state = { open, disabled };
    return (
        <CollapsibleContext.Provider value={context}>
            {renderElement("div", props, state, {
                "data-primitives-part": "collapsible-root",
                ...stateAttributes(collapsibleAttributes(state)),
            })}
        </CollapsibleContext.Provider>
    );
}
