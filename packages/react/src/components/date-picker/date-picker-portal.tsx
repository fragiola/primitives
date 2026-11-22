import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { DatePickerContext } from "./date-picker-context.ts";

export interface DatePickerPortalProps {
    children?: ReactNode;
    container?: Element | null;
}

/** Moves the positioner to `container` (default: the body) while the popup is mounted. */
export function DatePickerPortal({
    children,
    container,
}: DatePickerPortalProps) {
    const context = useRequiredContext(DatePickerContext, "DatePicker.Portal");
    if (!context.presence.mounted || typeof document === "undefined") {
        return null;
    }
    return createPortal(children, container ?? document.body);
}
