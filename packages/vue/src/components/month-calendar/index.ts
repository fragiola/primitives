// The entry of @fragiola/primitives-vue/month-calendar: a grid of the 12 months of a year for
// choosing one month (spec/month-calendar.md, the APG grid with the calendar's keys). Its parts and
// state serve the range and year calendars too; its month math and locale data are the toolkit's
// `/month-year`, which only the month and year entries import.

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
export type { MonthCalendarCellProps } from "./month-calendar-cell.ts";
export type { MonthCalendarCellState } from "./month-calendar-context.ts";
export type { MonthCalendarGridProps } from "./month-calendar-grid.ts";
export type { MonthCalendarGridBodySlots } from "./month-calendar-grid-body.ts";
export type {
    MonthCalendarHeadingProps,
    MonthCalendarHeadingState,
} from "./month-calendar-heading.ts";
export type { MonthCalendarNextButtonProps } from "./month-calendar-next-button.ts";
export type { MonthCalendarPageButtonState } from "./month-calendar-page-button.ts";
export type { MonthCalendarPrevButtonProps } from "./month-calendar-prev-button.ts";
export type {
    MonthCalendarRootEmits,
    MonthCalendarRootProps,
} from "./month-calendar-root.ts";
export type {
    MonthCalendarRootSharedProps,
    MonthCalendarRootState,
} from "./month-calendar-root-base.ts";
export type {
    MonthCalendarRowProps,
    MonthCalendarRowSlots,
} from "./month-calendar-row.ts";
export type { MonthCalendarItem } from "./month-calendar-value.ts";
export { MonthCalendar } from "./parts.ts";
