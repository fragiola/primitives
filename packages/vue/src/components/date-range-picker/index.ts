// The entry of @fragiola/primitives-vue/date-range-picker: a trigger and a non-modal popup holding
// a bound RangeCalendar (spec/calendar.md; the RangeCalendar comes from `/range-calendar`). Its
// parts are the DatePicker's, from the date picker's modules.

export type { DateRange, PlainDate } from "@fragiola/primitives/date";
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
} from "../date-picker/date-picker-popup.ts";
export type { DatePickerPortalProps } from "../date-picker/date-picker-portal.ts";
export type { DatePickerPositionerState } from "../date-picker/date-picker-positioner.ts";
export type {
    DatePickerFormProps,
    DatePickerRootSharedProps,
} from "../date-picker/date-picker-root-base.ts";
export type {
    DatePickerTriggerProps,
    DatePickerTriggerState,
} from "../date-picker/date-picker-trigger.ts";
export type {
    DateRangePickerRootEmits,
    DateRangePickerRootProps,
} from "./date-range-picker-root.ts";
export { DateRangePicker } from "./parts.ts";
