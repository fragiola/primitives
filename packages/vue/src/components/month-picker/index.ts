// The entry of @fragiola/primitives-vue/month-picker: a trigger and a non-modal popup holding a
// bound MonthCalendar (one month; spec/month-calendar.md; the calendar comes from `/month-calendar`). Its parts
// are the DatePicker's; it exports the DatePicker's namespace too, so the picker's modules stay in
// one chunk of the build and `/date-picker` is unchanged.

export type { PlainYearMonth } from "@fragiola/primitives/month-year";
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
export type {
    MonthPickerRootEmits,
    MonthPickerRootProps,
} from "./month-picker-root.ts";
export type { MonthPickerRootSharedProps } from "./month-picker-root-base.ts";
export { MonthPicker } from "./parts.ts";
