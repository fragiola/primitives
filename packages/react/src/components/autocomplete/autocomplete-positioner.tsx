import { openOverlaySession } from "@fragiola/primitives/overlay";
import { useEffect, useLayoutEffect } from "react";
import {
    type PositionerProps,
    usePositioner,
} from "../../hooks/use-positioner.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { AutocompleteContext } from "./autocomplete-context.ts";

export interface AutocompletePositionerState {
    open: boolean;
    side: string;
    align: string;
}

export interface AutocompletePositionerProps
    extends PartProps<AutocompletePositionerState>,
        PositionerProps {}

/**
 * Places the list under the InputGroup (else the Input); the open list is a layer (Escape,
 * outside press).
 */
export function AutocompletePositioner({
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    anchor,
    ...props
}: AutocompletePositionerProps) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.Positioner",
    );
    const {
        open,
        positioner,
        trigger,
        button,
        inputGroup,
        clearButton,
        setOpen,
        setPlaced,
    } = context;
    const placed = usePositioner(
        { side, align, sideOffset, alignOffset, collisionPadding, anchor },
        { side: "bottom", align: "start" },
        inputGroup ?? trigger,
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
            ignore: () => [trigger, button, inputGroup, clearButton],
            dismiss: (reason, event) => setOpen(false, reason, event),
        });
        return session.end;
    }, [open, positioner, trigger, button, inputGroup, clearButton, setOpen]);
    return renderElement(
        "div",
        props,
        { open, ...placed },
        {
            role: "presentation",
            hidden: context.presence.mounted ? undefined : true,
            "data-primitives-part": "autocomplete-positioner",
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
