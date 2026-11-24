// The entry of @fragiola/primitives-angular/color-picker-popover: a ColorPicker's opt-in popup, a
// trigger and a non-modal dialog on Popover's overlay lifecycle (spec/color-picker.md; the
// `[colorPickerRoot]` comes from `/color-picker`, which bundles no overlay code), as standalone
// attribute directives on the consumer's own elements.

export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OpenChangeEvent,
    OverlayActions,
    OverlayPortalOptions,
} from "@fragiola/primitives-angular/internal";
export {
    ColorPickerPopoverPopup,
    type ColorPickerPopoverPopupState,
} from "./directives/color-picker-popover-popup.directive.ts";
export { ColorPickerPopoverPortal } from "./directives/color-picker-popover-portal.directive.ts";
export {
    ColorPickerPopoverPositioner,
    type ColorPickerPopoverPositionerState,
} from "./directives/color-picker-popover-positioner.directive.ts";
export {
    ColorPickerPopoverRoot,
    type ColorPickerPopoverState,
} from "./directives/color-picker-popover-root.directive.ts";
export { ColorPickerPopoverTrigger } from "./directives/color-picker-popover-trigger.directive.ts";
