import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { ColorPickerPopoverContext } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverPortalProps extends OverlayPortalProps {}

/** Moves the positioner to `container` (default: the body) while the popup is mounted. */
export function ColorPickerPopoverPortal(props: ColorPickerPopoverPortalProps) {
    const context = useRequiredContext(
        ColorPickerPopoverContext,
        "ColorPickerPopover.Portal",
    );
    return useOverlayPortal(context.presence.mounted, props);
}
