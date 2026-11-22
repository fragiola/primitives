import type { Align, Side } from "@fragiola/primitives/positioning";
import { type ReactNode, useMemo, useState } from "react";
import {
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import { useAttachHandle } from "../../hooks/use-overlay-trigger.ts";
import { PopoverContext } from "./popover-context.ts";
import type { PopoverHandle } from "./popover-handle.ts";

export interface PopoverRootProps<Payload = unknown>
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** Connects Triggers rendered outside the Root (spec/popover.md, "Detached triggers"). */
    handle?: PopoverHandle<Payload>;
    /** The content, or a function of the active trigger's payload. */
    children?:
        | ReactNode
        | ((state: { payload: Payload | undefined }) => ReactNode);
}

/** Holds the popover's state; renders no element (spec/popover.md). */
export function PopoverRoot<Payload = unknown>({
    children,
    handle,
    ...props
}: PopoverRootProps<Payload>) {
    const root = useOverlayRoot(props);
    const [arrow, setArrow] = useState<HTMLElement | null>(null);
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "center",
    });
    const [titleId, setTitleId] = useState<string>();
    const [descriptionId, setDescriptionId] = useState<string>();
    const value = useMemo(
        () => ({
            ...root,
            arrow,
            setArrow,
            placed,
            setPlaced,
            titleId,
            setTitleId,
            descriptionId,
            setDescriptionId,
        }),
        [root, arrow, placed, titleId, descriptionId],
    );
    useAttachHandle(handle, value);
    return (
        <PopoverContext.Provider value={value}>
            {typeof children === "function"
                ? children({ payload: root.payload as Payload | undefined })
                : children}
        </PopoverContext.Provider>
    );
}
