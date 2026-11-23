// The entry of @fragiola/primitives-vue/month-range-calendar: a range of months (spec/month-calendar.md). Its parts and
// state are the MonthCalendar's, from its modules; it exports the MonthCalendar's namespace too,
// so the month calendar's modules stay in one chunk of the build.

export type {
    PlainYear,
    PlainYearMonth,
    YearMonthRange,
    YearRange,
} from "@fragiola/primitives/month-year";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { MonthCalendarCellProps } from "../month-calendar/month-calendar-cell.ts";
export type { MonthCalendarCellState } from "../month-calendar/month-calendar-context.ts";
export type { MonthCalendarGridProps } from "../month-calendar/month-calendar-grid.ts";
export type { MonthCalendarGridBodySlots } from "../month-calendar/month-calendar-grid-body.ts";
export type {
    MonthCalendarHeadingProps,
    MonthCalendarHeadingState,
} from "../month-calendar/month-calendar-heading.ts";
export type { MonthCalendarNextButtonProps } from "../month-calendar/month-calendar-next-button.ts";
export type { MonthCalendarPageButtonState } from "../month-calendar/month-calendar-page-button.ts";
export type { MonthCalendarPrevButtonProps } from "../month-calendar/month-calendar-prev-button.ts";
export type {
    MonthCalendarRootSharedProps,
    MonthCalendarRootState,
} from "../month-calendar/month-calendar-root-base.ts";
export type {
    MonthCalendarRowProps,
    MonthCalendarRowSlots,
} from "../month-calendar/month-calendar-row.ts";
export type { MonthCalendarItem } from "../month-calendar/month-calendar-value.ts";
export { MonthCalendar } from "../month-calendar/parts.ts";
export type {
    MonthRangeCalendarRootEmits,
    MonthRangeCalendarRootProps,
} from "./month-range-calendar-root.ts";
export { MonthRangeCalendar } from "./parts.ts";
