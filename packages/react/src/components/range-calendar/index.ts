// The entry of @fragiola/primitives-react/range-calendar: the month grid for choosing a start and
// an end date (spec/calendar.md). Its parts are the Calendar's, from the calendar's modules.

export type {
    DateRange,
    PlainDate,
    Weekday,
} from "@fragiola/primitives/date";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { CalendarCellProps } from "../calendar/calendar-cell.tsx";
export type { CalendarCellState } from "../calendar/calendar-context.ts";
export type { CalendarGridProps } from "../calendar/calendar-grid.tsx";
export type { CalendarGridBodyProps } from "../calendar/calendar-grid-body.tsx";
export type { CalendarGridHeaderProps } from "../calendar/calendar-grid-header.tsx";
export type {
    CalendarHeaderCellProps,
    CalendarHeaderCellState,
} from "../calendar/calendar-header-cell.tsx";
export type {
    CalendarHeadingProps,
    CalendarHeadingState,
} from "../calendar/calendar-heading.tsx";
export type { CalendarNextButtonProps } from "../calendar/calendar-next-button.tsx";
export type { CalendarPageButtonState } from "../calendar/calendar-page-button.tsx";
export type { CalendarPrevButtonProps } from "../calendar/calendar-prev-button.tsx";
export type {
    CalendarRootSharedProps,
    CalendarRootState,
} from "../calendar/calendar-root-base.tsx";
export type { CalendarRowProps } from "../calendar/calendar-row.tsx";
export type { CalendarOptions } from "../calendar/calendar-value.ts";
export { RangeCalendar } from "./parts.ts";
export type { RangeCalendarRootProps } from "./range-calendar-root.tsx";
