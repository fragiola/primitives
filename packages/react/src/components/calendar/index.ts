// The entry of @fragiola/primitives-react/calendar: a month grid for choosing one date
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
export type { RenderProp } from "../../utils/render-element.tsx";
export type { CalendarCellProps } from "./calendar-cell.tsx";
export type { CalendarCellState } from "./calendar-context.ts";
export type { CalendarGridProps } from "./calendar-grid.tsx";
export type { CalendarGridBodyProps } from "./calendar-grid-body.tsx";
export type { CalendarGridHeaderProps } from "./calendar-grid-header.tsx";
export type {
    CalendarHeaderCellProps,
    CalendarHeaderCellState,
} from "./calendar-header-cell.tsx";
export type {
    CalendarHeadingProps,
    CalendarHeadingState,
} from "./calendar-heading.tsx";
export type { CalendarNextButtonProps } from "./calendar-next-button.tsx";
export type { CalendarPageButtonState } from "./calendar-page-button.tsx";
export type { CalendarPrevButtonProps } from "./calendar-prev-button.tsx";
export type { CalendarRootProps } from "./calendar-root.tsx";
export type {
    CalendarRootSharedProps,
    CalendarRootState,
} from "./calendar-root-base.tsx";
export type { CalendarRowProps } from "./calendar-row.tsx";
export type { CalendarOptions } from "./calendar-value.ts";
export { Calendar } from "./parts.ts";
