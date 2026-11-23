import { MonthCalendarCell } from "./month-calendar-cell.ts";
import { MonthCalendarGrid } from "./month-calendar-grid.ts";
import { MonthCalendarGridBody } from "./month-calendar-grid-body.ts";
import { MonthCalendarHeading } from "./month-calendar-heading.ts";
import { MonthCalendarNextButton } from "./month-calendar-next-button.ts";
import { MonthCalendarPrevButton } from "./month-calendar-prev-button.ts";
import { MonthCalendarRoot } from "./month-calendar-root.ts";
import { MonthCalendarRow } from "./month-calendar-row.ts";

/** spec/month-calendar.md: one month, in a grid of the 12 months of a year */
export const MonthCalendar = {
    Root: MonthCalendarRoot,
    Heading: MonthCalendarHeading,
    PrevButton: MonthCalendarPrevButton,
    NextButton: MonthCalendarNextButton,
    Grid: MonthCalendarGrid,
    GridBody: MonthCalendarGridBody,
    Row: MonthCalendarRow,
    Cell: MonthCalendarCell,
};
