// The entry of @fragiola/primitives-vue/year-range-picker: a trigger and a non-modal popup holding a
// bound YearRangeCalendar (a range of years; spec/month-calendar.md; the calendar comes from `/year-range-calendar`). Its parts
// are the DatePicker's; it exports the DatePicker's namespace too, so the picker's modules stay in
// one chunk of the build and `/date-picker` is unchanged.

export type {
    PlainYear,
    YearRange,
} from "@fragiola/primitives/month-year";
export type {
    Align,
    Side,
} from "@fragiola/primitives/positioning";
export type {
    OverlayRootEmits,
    OverlayRootProps,
} from "../../composables/use-overlay-root.ts";
export type { PositionerProps } from "../../composables/use-positioner.ts";
export type {
    ChangeDetails,
    ChangeReason,
    OpenChangeDetails,
    OverlayActions,
} from "../../utils/change-details.ts";
export type { OverlayPortalProps } from "../../utils/overlay-portal.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    DatePickerPopupProps,
    DatePickerPopupState,
} from "../date-picker/date-picker-popup.ts";
export type { DatePickerPortalProps } from "../date-picker/date-picker-portal.ts";
export type { DatePickerPositionerState } from "../date-picker/date-picker-positioner.ts";
export type {
    DatePickerTriggerProps,
    DatePickerTriggerState,
} from "../date-picker/date-picker-trigger.ts";
export { DatePicker } from "../date-picker/parts.ts";
export type { MonthPickerRootSharedProps } from "../month-picker/month-picker-root-base.ts";
export { YearRangePicker } from "./parts.ts";
export type {
    YearRangePickerRootEmits,
    YearRangePickerRootProps,
} from "./year-range-picker-root.ts";
