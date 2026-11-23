// The entry of @fragiola/primitives-react/hover-card: a preview of a link's content, shown on hover
// and keyboard focus (spec/hover-card.md, Base UI's PreviewCard).

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
export {
    createHoverCardHandle,
    type HoverCardHandle,
} from "./hover-card-handle.ts";
export type { HoverCardPopupState } from "./hover-card-popup.tsx";
export type { HoverCardPortalProps } from "./hover-card-portal.tsx";
export type {
    HoverCardPositionerProps,
    HoverCardPositionerState,
} from "./hover-card-positioner.tsx";
export type { HoverCardRootProps } from "./hover-card-root.tsx";
export type { HoverCardTriggerProps } from "./hover-card-trigger.tsx";
export { HoverCard } from "./parts.ts";
