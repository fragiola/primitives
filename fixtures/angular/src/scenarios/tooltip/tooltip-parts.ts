import {
    TooltipArrow,
    TooltipPopup,
    TooltipPortal,
    TooltipPositioner,
    TooltipRoot,
    TooltipTrigger,
} from "@fragiola/primitives-angular/tooltip";

/** Every Tooltip directive but the Provider, for a scenario's `imports`. */
export const TOOLTIP_PARTS = [
    TooltipRoot,
    TooltipTrigger,
    TooltipPortal,
    TooltipPositioner,
    TooltipPopup,
    TooltipArrow,
] as const;
