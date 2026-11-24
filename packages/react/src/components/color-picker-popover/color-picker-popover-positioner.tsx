import type { Align, Side } from "@fragiola/primitives/positioning";
import { useLayoutEffect } from "react";
import {
    type PositionerProps,
    usePositioner,
} from "../../hooks/use-positioner.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ColorPickerPopoverContext } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverPositionerState {
    open: boolean;
    side: Side;
    align: Align;
}

export interface ColorPickerPopoverPositionerProps
    extends PartProps<ColorPickerPopoverPositionerState>,
        PositionerProps {}

/** Places the popup next to the trigger: below it, aligned to its start (a picker's default). */
export function ColorPickerPopoverPositioner({
    side,
    align,
    sideOffset,
    alignOffset,
    collisionPadding,
    anchor,
    ...props
}: ColorPickerPopoverPositionerProps) {
    const context = useRequiredContext(
        ColorPickerPopoverContext,
        "ColorPickerPopover.Positioner",
    );
    const placed = usePositioner(
        { side, align, sideOffset, alignOffset, collisionPadding, anchor },
        { side: "bottom", align: "start" },
        context.trigger,
        context.positioner,
        null,
        context.presence.mounted,
    );
    const { setPlaced } = context;
    useLayoutEffect(() => setPlaced(placed), [placed, setPlaced]);
    return renderElement(
        "div",
        props,
        { open: context.open, ...placed },
        {
            role: "presentation",
            hidden: context.presence.mounted ? undefined : true,
            "data-primitives-part": "color-picker-popover-positioner",
            ...stateAttributes({
                open: context.open,
                closed: !context.open,
                side: placed.side,
                align: placed.align,
            }),
        },
        context.setPositioner,
    );
}
