// The entry of @fragiola/primitives-vue/calendar: a month grid for choosing one date
// (spec/calendar.md, the APG grid of the date picker dialog example). Its date math and locale
// data are the toolkit's `/date`, which only the calendar and picker entries import.

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
export type { CalendarCellProps } from "./calendar-cell.ts";
export type { CalendarCellState } from "./calendar-context.ts";
export type { CalendarGridProps } from "./calendar-grid.ts";
export type { CalendarGridBodySlots } from "./calendar-grid-body.ts";
export type { CalendarGridHeaderSlots } from "./calendar-grid-header.ts";
export type {
    CalendarHeaderCellProps,
    CalendarHeaderCellState,
} from "./calendar-header-cell.ts";
export type {
    CalendarHeadingProps,
    CalendarHeadingState,
} from "./calendar-heading.ts";
export type { CalendarNextButtonProps } from "./calendar-next-button.ts";
export type { CalendarPageButtonState } from "./calendar-page-button.ts";
export type { CalendarPrevButtonProps } from "./calendar-prev-button.ts";
export type { CalendarRootEmits, CalendarRootProps } from "./calendar-root.ts";
export type {
    CalendarRootSharedProps,
    CalendarRootState,
} from "./calendar-root-base.ts";
export type { CalendarRowProps, CalendarRowSlots } from "./calendar-row.ts";
export type { CalendarOptions } from "./calendar-value.ts";
export { Calendar } from "./parts.ts";
