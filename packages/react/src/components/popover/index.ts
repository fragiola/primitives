// The entry of @fragiola/primitives-react/popover: non-modal floating content anchored to a
// trigger (spec/popover.md, the APG's non-modal dialog disclosed by a button).

export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    FocusTarget,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Popover } from "./parts.ts";
export type {
    PopoverPopupProps,
    PopoverPopupState,
} from "./popover-popup.tsx";
export type { PopoverPortalProps } from "./popover-portal.tsx";
export type {
    PopoverPositionerProps,
    PopoverPositionerState,
} from "./popover-positioner.tsx";
export type { PopoverRootProps } from "./popover-root.tsx";
export type {
    PopoverTriggerProps,
    PopoverTriggerState,
} from "./popover-trigger.tsx";
