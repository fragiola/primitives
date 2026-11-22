// The entry of @fragiola/primitives-vue/date-picker: a trigger and a non-modal popup holding a
// bound Calendar (spec/calendar.md; the Calendar comes from `/calendar`).

export type { PlainDate } from "@fragiola/primitives/date";
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
export type { CalendarOptions } from "../calendar/calendar-value.ts";
export type {
    DatePickerPopupProps,
    DatePickerPopupState,
} from "./date-picker-popup.ts";
export type { DatePickerPortalProps } from "./date-picker-portal.ts";
export type { DatePickerPositionerState } from "./date-picker-positioner.ts";
export type {
    DatePickerRootEmits,
    DatePickerRootProps,
} from "./date-picker-root.ts";
export type {
    DatePickerFormProps,
    DatePickerRootSharedProps,
} from "./date-picker-root-base.ts";
export type {
    DatePickerTriggerProps,
    DatePickerTriggerState,
} from "./date-picker-trigger.ts";
export { DatePicker } from "./parts.ts";
