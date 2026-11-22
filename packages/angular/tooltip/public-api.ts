// The entry of @fragiola/primitives-angular/tooltip: a control's short description, shown on
// hover and keyboard focus (spec/tooltip.md, the APG's tooltip pattern), as standalone attribute
// directives on the consumer's own elements.

export type { Align, Side } from "@fragiola/primitives/positioning";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { TooltipArrow } from "./directives/tooltip-arrow.directive.ts";
export {
    TooltipPopup,
    type TooltipPopupState,
} from "./directives/tooltip-popup.directive.ts";
export { TooltipPortal } from "./directives/tooltip-portal.directive.ts";
export { TooltipPositioner } from "./directives/tooltip-positioner.directive.ts";
export { TooltipProvider } from "./directives/tooltip-provider.directive.ts";
export {
    TooltipRoot,
    type TooltipState,
} from "./directives/tooltip-root.directive.ts";
export { TooltipTrigger } from "./directives/tooltip-trigger.directive.ts";
export { injectTooltip } from "./inject/inject-tooltip.ts";
