import { MonthCalendarCell } from "../month-calendar/month-calendar-cell.ts";
import { MonthCalendarGrid } from "../month-calendar/month-calendar-grid.ts";
import { MonthCalendarGridBody } from "../month-calendar/month-calendar-grid-body.ts";
import { MonthCalendarHeading } from "../month-calendar/month-calendar-heading.ts";
import { MonthCalendarNextButton } from "../month-calendar/month-calendar-next-button.ts";
import { MonthCalendarPrevButton } from "../month-calendar/month-calendar-prev-button.ts";
import { MonthCalendarRow } from "../month-calendar/month-calendar-row.ts";
import { YearCalendarRoot } from "./year-calendar-root.ts";

/** spec/month-calendar.md: one year, in a grid of a page of 12 years, with the MonthCalendar's parts (named `year-calendar-*`) */
export const YearCalendar = {
    Root: YearCalendarRoot,
    Heading: MonthCalendarHeading,
    PrevButton: MonthCalendarPrevButton,
    NextButton: MonthCalendarNextButton,
    Grid: MonthCalendarGrid,
    GridBody: MonthCalendarGridBody,
    Row: MonthCalendarRow,
    Cell: MonthCalendarCell,
};
