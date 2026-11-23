// The entry of @fragiola/primitives-react/year-range-picker: a trigger and a non-modal popup holding a
// bound YearRangeCalendar (a range of years; spec/month-calendar.md; the calendar comes from `/year-range-calendar`). Its parts
// are the DatePicker's; it exports the DatePicker's namespace too, so the picker's modules stay in
// one chunk of the build and `/date-picker` is unchanged.

export type { PlainYear, YearRange } from "@fragiola/primitives/month-year";
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
export type {
    DatePickerPopupProps,
    DatePickerPopupState,
} from "../date-picker/date-picker-popup.tsx";
export type { DatePickerPortalProps } from "../date-picker/date-picker-portal.tsx";
export type {
    DatePickerPositionerProps,
    DatePickerPositionerState,
} from "../date-picker/date-picker-positioner.tsx";
export type {
    DatePickerTriggerProps,
    DatePickerTriggerState,
} from "../date-picker/date-picker-trigger.tsx";
export { DatePicker } from "../date-picker/parts.ts";
export type { MonthPickerRootSharedProps } from "../month-picker/month-picker-root-base.tsx";
export { YearRangePicker } from "./parts.ts";
export type { YearRangePickerRootProps } from "./year-range-picker-root.tsx";
