import {
    type OverlayPortalProps,
    useOverlayPortal,
} from "../../hooks/use-overlay-portal.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { DatePickerContext } from "./date-picker-context.ts";

export interface DatePickerPortalProps extends OverlayPortalProps {}

/** Moves the positioner to `container` (default: the body) while the popup is mounted. */
export function DatePickerPortal(props: DatePickerPortalProps) {
    const context = useRequiredContext(DatePickerContext, "DatePicker.Portal");
    return useOverlayPortal(context.presence.mounted, props);
}
