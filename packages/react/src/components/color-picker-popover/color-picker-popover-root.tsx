import type { Align, Side } from "@fragiola/primitives/positioning";
import { type ReactNode, useContext, useMemo, useState } from "react";
import {
    type OverlayRootProps,
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import { ColorPickerBindingContext } from "../../utils/color-picker-binding.ts";
import { ColorPickerPopoverContext } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverRootProps extends OverlayRootProps {
    children?: ReactNode;
}

/**
 * The open state of a ColorPicker's popup (spec/color-picker.md, `/color-picker-popover`): placed
 * inside a ColorPicker's Root, on Popover's overlay lifecycle. Renders no element of its own.
 */
export function ColorPickerPopoverRoot({
    children,
    ...overlayProps
}: ColorPickerPopoverRootProps) {
    const root = useOverlayRoot(overlayProps);
    const picker = useContext(ColorPickerBindingContext);
    const disabled = picker?.disabled ?? false;
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "start",
    });
    const context = useMemo(
        () => ({ ...root, placed, setPlaced, disabled }),
        [root, placed, disabled],
    );
    return (
        <ColorPickerPopoverContext.Provider value={context}>
            {children}
        </ColorPickerPopoverContext.Provider>
    );
}
