// The entry of @fragiola/primitives-vue/hover-card: a preview of a link's content, shown on hover
// and keyboard focus (spec/hover-card.md, Base UI's PreviewCard).

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
export type { HoverCardArrowState } from "./hover-card-arrow.ts";
export type { HoverCardBackdropState } from "./hover-card-backdrop.ts";
export {
    createHoverCardHandle,
    type HoverCardHandle,
} from "./hover-card-handle.ts";
export type { HoverCardPopupState } from "./hover-card-popup.ts";
export type { HoverCardPortalProps } from "./hover-card-portal.ts";
export type { HoverCardPositionerState } from "./hover-card-positioner.ts";
export type {
    HoverCardRootEmits,
    HoverCardRootProps,
} from "./hover-card-root.ts";
export type {
    HoverCardTriggerProps,
    HoverCardTriggerState,
} from "./hover-card-trigger.ts";
export { HoverCard } from "./parts.ts";
