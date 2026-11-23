// The entry of @fragiola/primitives-react/year-range-calendar: a range of years (spec/month-calendar.md). Its parts and
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type { MonthCalendarCellProps } from "../month-calendar/month-calendar-cell.tsx";
export type { MonthCalendarCellState } from "../month-calendar/month-calendar-context.ts";
export type { MonthCalendarGridProps } from "../month-calendar/month-calendar-grid.tsx";
export type { MonthCalendarGridBodyProps } from "../month-calendar/month-calendar-grid-body.tsx";
export type {
    MonthCalendarHeadingProps,
    MonthCalendarHeadingState,
} from "../month-calendar/month-calendar-heading.tsx";
export type { MonthCalendarNextButtonProps } from "../month-calendar/month-calendar-next-button.tsx";
export type { MonthCalendarPageButtonState } from "../month-calendar/month-calendar-page-button.tsx";
export type { MonthCalendarPrevButtonProps } from "../month-calendar/month-calendar-prev-button.tsx";
export type {
    MonthCalendarRootSharedProps,
    MonthCalendarRootState,
} from "../month-calendar/month-calendar-root-base.tsx";
export type { MonthCalendarRowProps } from "../month-calendar/month-calendar-row.tsx";
export type { MonthCalendarItem } from "../month-calendar/month-calendar-value.ts";
export { MonthCalendar } from "../month-calendar/parts.ts";
export { YearRangeCalendar } from "./parts.ts";
export type { YearRangeCalendarRootProps } from "./year-range-calendar-root.tsx";
