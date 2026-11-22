// The entry of @fragiola/primitives-react/tooltip: a control's short description, shown on hover
// and keyboard focus (spec/tooltip.md, the APG's tooltip pattern).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Tooltip } from "./parts.ts";
export type { TooltipPopupState } from "./tooltip-popup.tsx";
export type { TooltipPortalProps } from "./tooltip-portal.tsx";
export type {
    TooltipPositionerProps,
    TooltipPositionerState,
} from "./tooltip-positioner.tsx";
export type { TooltipProviderProps } from "./tooltip-provider.tsx";
export type { TooltipRootProps } from "./tooltip-root.tsx";
