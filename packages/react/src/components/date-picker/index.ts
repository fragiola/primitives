// The entry of @fragiola/primitives-react/date-picker: a trigger and a non-modal popup holding a
// bound Calendar (spec/calendar.md; the Calendar comes from `/calendar`).

export type { PlainDate } from "@fragiola/primitives/date";
export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type { OverlayPortalProps } from "../../hooks/use-overlay-portal.ts";
export type { OverlayRootProps } from "../../hooks/use-overlay-root.ts";
export type { PositionerProps } from "../../hooks/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { CalendarOptions } from "../calendar/calendar-value.ts";
export type {
    DatePickerPopupProps,
    DatePickerPopupState,
} from "./date-picker-popup.tsx";
export type { DatePickerPortalProps } from "./date-picker-portal.tsx";
export type {
    DatePickerPositionerProps,
    DatePickerPositionerState,
} from "./date-picker-positioner.tsx";
export type { DatePickerRootProps } from "./date-picker-root.tsx";
export type { DatePickerRootSharedProps } from "./date-picker-root-base.tsx";
export type {
    DatePickerTriggerProps,
    DatePickerTriggerState,
} from "./date-picker-trigger.tsx";
export { DatePicker } from "./parts.ts";
