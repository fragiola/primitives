// The entry of @fragiola/primitives-vue/color-picker-popover: a ColorPicker's opt-in popup, a
// trigger and a non-modal dialog on Popover's overlay lifecycle (spec/color-picker.md; the picker
// comes from `/color-picker`, which bundles no overlay code).

export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    OverlayRootEmits,
    OverlayRootProps,
} from "../../composables/use-overlay-root.ts";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayPortalProps } from "../../utils/overlay-portal.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    ColorPickerPopoverPopupProps,
    ColorPickerPopoverPopupState,
} from "./color-picker-popover-popup.ts";
export type { ColorPickerPopoverPortalProps } from "./color-picker-popover-portal.ts";
export type { ColorPickerPopoverPositionerState } from "./color-picker-popover-positioner.ts";
export type {
    ColorPickerPopoverRootEmits,
    ColorPickerPopoverRootProps,
} from "./color-picker-popover-root.ts";
export type {
    ColorPickerPopoverTriggerProps,
    ColorPickerPopoverTriggerState,
} from "./color-picker-popover-trigger.ts";
export { ColorPickerPopover } from "./parts.ts";
