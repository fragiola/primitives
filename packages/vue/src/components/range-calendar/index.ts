// The entry of @fragiola/primitives-vue/range-calendar: the month grid for choosing a start and an
// end date (spec/calendar.md). Its parts are the Calendar's, from the calendar's modules.

export type {
    DateRange,
    PlainDate,
    Weekday,
} from "@fragiola/primitives/date";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { CalendarCellProps } from "../calendar/calendar-cell.ts";
export type { CalendarCellState } from "../calendar/calendar-context.ts";
export type { CalendarGridProps } from "../calendar/calendar-grid.ts";
export type { CalendarGridBodySlots } from "../calendar/calendar-grid-body.ts";
export type { CalendarGridHeaderSlots } from "../calendar/calendar-grid-header.ts";
export type {
    CalendarHeaderCellProps,
    CalendarHeaderCellState,
} from "../calendar/calendar-header-cell.ts";
export type {
    CalendarHeadingProps,
    CalendarHeadingState,
} from "../calendar/calendar-heading.ts";
export type { CalendarNextButtonProps } from "../calendar/calendar-next-button.ts";
export type { CalendarPageButtonState } from "../calendar/calendar-page-button.ts";
export type { CalendarPrevButtonProps } from "../calendar/calendar-prev-button.ts";
export type {
    CalendarRootSharedProps,
    CalendarRootState,
} from "../calendar/calendar-root-base.ts";
export type {
    CalendarRowProps,
    CalendarRowSlots,
} from "../calendar/calendar-row.ts";
export type { CalendarOptions } from "../calendar/calendar-value.ts";
export { RangeCalendar } from "./parts.ts";
export type {
    RangeCalendarRootEmits,
    RangeCalendarRootProps,
} from "./range-calendar-root.ts";
