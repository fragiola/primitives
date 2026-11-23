// The entry of @fragiola/primitives-angular/hover-card: a preview of a link's content, shown on
// hover and keyboard focus (spec/hover-card.md, Base UI's PreviewCard), as standalone attribute
// directives on the consumer's own elements.

export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OpenChangeEvent,
    OverlayActions,
    OverlayHandle,
    OverlayPortalOptions,
} from "@fragiola/primitives-angular/internal";
export { HoverCardArrow } from "./directives/hover-card-arrow.directive.ts";
export { HoverCardBackdrop } from "./directives/hover-card-backdrop.directive.ts";
export {
    HoverCardPopup,
    type HoverCardPopupState,
} from "./directives/hover-card-popup.directive.ts";
export { HoverCardPortal } from "./directives/hover-card-portal.directive.ts";
export { HoverCardPositioner } from "./directives/hover-card-positioner.directive.ts";
export {
    HoverCardRoot,
    type HoverCardState,
} from "./directives/hover-card-root.directive.ts";
export {
    HoverCardTrigger,
    type HoverCardTriggerState,
} from "./directives/hover-card-trigger.directive.ts";
export {
    createHoverCardHandle,
    type HoverCardHandle,
} from "./utils/hover-card-handle.ts";
