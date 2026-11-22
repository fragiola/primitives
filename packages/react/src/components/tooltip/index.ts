// The entry of @fragiola/primitives-react/tooltip: a control's short description, shown on hover
// and keyboard focus (spec/tooltip.md, the APG's tooltip pattern).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type {
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../hooks/use-overlay-root.ts";
export type { OverlayTriggerProps } from "../../hooks/use-overlay-trigger.ts";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayHandle } from "../../utils/overlay-handle.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Tooltip } from "./parts.ts";
export {
    createTooltipHandle,
    type TooltipHandle,
} from "./tooltip-handle.ts";
export type { TooltipPopupState } from "./tooltip-popup.tsx";
export type { TooltipPortalProps } from "./tooltip-portal.tsx";
export type {
    TooltipPositionerProps,
    TooltipPositionerState,
} from "./tooltip-positioner.tsx";
export type { TooltipProviderProps } from "./tooltip-provider.tsx";
export type { TooltipRootProps } from "./tooltip-root.tsx";
export type { TooltipTriggerProps } from "./tooltip-trigger.tsx";
