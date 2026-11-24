import { openOverlaySession } from "@fragiola/primitives/overlay";
import { useEffect, useLayoutEffect } from "react";
import {
    type PositionerProps,
    usePositioner,
} from "../../hooks/use-positioner.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CascadeSelectContext } from "./cascade-select-context.ts";

export interface CascadeSelectPositionerState {
    open: boolean;
    side: string;
    align: string;
}

export interface CascadeSelectPositionerProps
    extends PartProps<CascadeSelectPositionerState>,
        PositionerProps {}

const NEVER = new Set<string>();

/**
 * Places the popup below the trigger, as Select's (spec/cascade-select.md, "Positioning"); the
 * open popup is a layer (Escape, outside press).
 */
export function CascadeSelectPositioner({
    side,
    align,
    sideOffset = 4,
    alignOffset,
    collisionPadding,
    anchor,
    ...props
}: CascadeSelectPositionerProps) {
    const context = useRequiredContext(
        CascadeSelectContext,
        "CascadeSelect.Positioner",
    );
    const { open, positioner, trigger, setOpen, setPlaced, lastReason } =
        context;
    const placed = usePositioner(
        { side, align, sideOffset, alignOffset, collisionPadding, anchor },
        { side: "bottom", align: "start" },
        trigger,
        positioner,
        null,
        context.presence.mounted,
    );
    useLayoutEffect(() => setPlaced(placed), [placed, setPlaced]);
    useEffect(() => {
        if (!open || positioner === null) {
            return undefined;
        }
        const session = openOverlaySession(positioner.ownerDocument, {
            elements: () => [positioner],
            ignore: () => [trigger],
            dismiss: (reason, event) => setOpen(false, reason, event),
            returnFocus: {
                when: NEVER,
                reason: () => lastReason.current,
                to: () => trigger,
            },
        });
        return session.end;
    }, [open, positioner, trigger, setOpen, lastReason]);
    return renderElement(
        "div",
        props,
        { open, ...placed },
        {
            role: "presentation",
            hidden: context.presence.mounted ? undefined : true,
            "data-primitives-part": "cascade-select-positioner",
            ...stateAttributes({
                open,
                closed: !open,
                side: placed.side,
                align: placed.align,
            }),
        },
        context.setPositioner,
    );
}
