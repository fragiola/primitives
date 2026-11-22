// The entry of @fragiola/primitives-vue/tooltip: a control's short description, shown on hover and
// keyboard focus (spec/tooltip.md, the APG's tooltip pattern).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type {
    OverlayRootEmits,
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../composables/use-overlay-root.ts";
export type { OverlayTriggerProps } from "../../composables/use-overlay-trigger.ts";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayHandle } from "../../utils/overlay-handle.ts";
export type { OverlayPortalProps } from "../../utils/overlay-portal.ts";
export type { OverlayRootSlots } from "../../utils/public-component.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Tooltip } from "./parts.ts";
export type { TooltipArrowState } from "./tooltip-arrow.ts";
export { createTooltipHandle, type TooltipHandle } from "./tooltip-handle.ts";
export type { TooltipPopupState } from "./tooltip-popup.ts";
export type { TooltipPortalProps } from "./tooltip-portal.ts";
export type { TooltipPositionerState } from "./tooltip-positioner.ts";
export type { TooltipProviderProps } from "./tooltip-provider.ts";
export type { TooltipRootEmits, TooltipRootProps } from "./tooltip-root.ts";
export type {
    TooltipTriggerProps,
    TooltipTriggerState,
} from "./tooltip-trigger.ts";
