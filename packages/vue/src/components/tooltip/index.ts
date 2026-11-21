// The entry of @fragiola/primitives-vue/tooltip: a control's short description, shown on hover and
// keyboard focus (spec/tooltip.md, the APG's tooltip pattern).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Tooltip } from "./parts.ts";
export type { TooltipArrowState } from "./tooltip-arrow.ts";
export type { TooltipPopupState } from "./tooltip-popup.ts";
export type { TooltipPortalProps } from "./tooltip-portal.ts";
export type { TooltipPositionerState } from "./tooltip-positioner.ts";
export type { TooltipProviderProps } from "./tooltip-provider.ts";
export type { TooltipRootEmits, TooltipRootProps } from "./tooltip-root.ts";
export type { TooltipTriggerState } from "./tooltip-trigger.ts";
