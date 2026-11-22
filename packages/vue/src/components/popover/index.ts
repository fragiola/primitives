// The entry of @fragiola/primitives-vue/popover: non-modal floating content anchored to a trigger
// (spec/popover.md, the APG's non-modal dialog disclosed by a button).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    FocusTarget,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { Popover } from "./parts.ts";
export type { PopoverArrowState } from "./popover-arrow.ts";
export type {
    PopoverPopupProps,
    PopoverPopupState,
} from "./popover-popup.ts";
export type { PopoverPortalProps } from "./popover-portal.ts";
export type { PopoverPositionerState } from "./popover-positioner.ts";
export type { PopoverRootEmits, PopoverRootProps } from "./popover-root.ts";
export type {
    PopoverTriggerProps,
    PopoverTriggerState,
} from "./popover-trigger.ts";
