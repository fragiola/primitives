// The entry of @fragiola/primitives-angular/popover: non-modal floating content anchored to a
// trigger (spec/popover.md, the APG's non-modal dialog disclosed by a button), as standalone
// attribute directives on the consumer's own elements.

export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    ChangeDetails,
    ChangeReason,
    FocusTarget,
    OpenChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { PopoverArrow } from "./directives/popover-arrow.directive.ts";
export { PopoverClose } from "./directives/popover-close.directive.ts";
export { PopoverDescription } from "./directives/popover-description.directive.ts";
export {
    PopoverPopup,
    type PopoverPopupState,
} from "./directives/popover-popup.directive.ts";
export { PopoverPortal } from "./directives/popover-portal.directive.ts";
export {
    PopoverPositioner,
    type PopoverPositionerState,
} from "./directives/popover-positioner.directive.ts";
export {
    PopoverRoot,
    type PopoverState,
} from "./directives/popover-root.directive.ts";
export { PopoverTitle } from "./directives/popover-title.directive.ts";
export {
    PopoverTrigger,
    type PopoverTriggerState,
} from "./directives/popover-trigger.directive.ts";
export { injectPopover } from "./inject/inject-popover.ts";
