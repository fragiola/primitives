// The entry of @fragiola/primitives-react/color-picker-popover: a ColorPicker's opt-in popup, a
// trigger and a non-modal dialog on Popover's overlay lifecycle (spec/color-picker.md; the picker
// comes from `/color-picker`, which bundles no overlay code).

export type { Align, Side } from "@fragiola/primitives/positioning";
export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type { OverlayRootProps } from "../../hooks/use-overlay-root.ts";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    ColorPickerPopoverPopupProps,
    ColorPickerPopoverPopupState,
} from "./color-picker-popover-popup.tsx";
export type { ColorPickerPopoverPortalProps } from "./color-picker-popover-portal.tsx";
export type {
    ColorPickerPopoverPositionerProps,
    ColorPickerPopoverPositionerState,
} from "./color-picker-popover-positioner.tsx";
export type { ColorPickerPopoverRootProps } from "./color-picker-popover-root.tsx";
export type {
    ColorPickerPopoverTriggerProps,
    ColorPickerPopoverTriggerState,
} from "./color-picker-popover-trigger.tsx";
export { ColorPickerPopover } from "./parts.ts";
