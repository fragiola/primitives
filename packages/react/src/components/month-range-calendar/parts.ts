import { MonthCalendarCell } from "../month-calendar/month-calendar-cell.tsx";
import { MonthCalendarGrid } from "../month-calendar/month-calendar-grid.tsx";
import { MonthCalendarGridBody } from "../month-calendar/month-calendar-grid-body.tsx";
import { MonthCalendarHeading } from "../month-calendar/month-calendar-heading.tsx";
import { MonthCalendarNextButton } from "../month-calendar/month-calendar-next-button.tsx";
import { MonthCalendarPrevButton } from "../month-calendar/month-calendar-prev-button.tsx";
import { MonthCalendarRow } from "../month-calendar/month-calendar-row.tsx";
import { MonthRangeCalendarRoot } from "./month-range-calendar-root.tsx";

/** spec/month-calendar.md: a range of months, with the MonthCalendar's parts (named `month-range-calendar-*`) */
export const MonthRangeCalendar = {
    Root: MonthRangeCalendarRoot,
    Heading: MonthCalendarHeading,
    PrevButton: MonthCalendarPrevButton,
    NextButton: MonthCalendarNextButton,
    Grid: MonthCalendarGrid,
    GridBody: MonthCalendarGridBody,
    Row: MonthCalendarRow,
    Cell: MonthCalendarCell,
};
