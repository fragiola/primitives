// The entry of @fragiola/primitives-react/month-calendar: a grid of the 12 months of a year for
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type { MonthCalendarCellProps } from "./month-calendar-cell.tsx";
export type { MonthCalendarCellState } from "./month-calendar-context.ts";
export type { MonthCalendarGridProps } from "./month-calendar-grid.tsx";
export type { MonthCalendarGridBodyProps } from "./month-calendar-grid-body.tsx";
export type {
    MonthCalendarHeadingProps,
    MonthCalendarHeadingState,
} from "./month-calendar-heading.tsx";
export type { MonthCalendarNextButtonProps } from "./month-calendar-next-button.tsx";
export type { MonthCalendarPageButtonState } from "./month-calendar-page-button.tsx";
export type { MonthCalendarPrevButtonProps } from "./month-calendar-prev-button.tsx";
export type { MonthCalendarRootProps } from "./month-calendar-root.tsx";
export type {
    MonthCalendarRootSharedProps,
    MonthCalendarRootState,
} from "./month-calendar-root-base.tsx";
export type { MonthCalendarRowProps } from "./month-calendar-row.tsx";
export type { MonthCalendarItem } from "./month-calendar-value.ts";
export { MonthCalendar } from "./parts.ts";
