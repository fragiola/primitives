import { MonthCalendarCell } from "./month-calendar-cell.tsx";
import { MonthCalendarGrid } from "./month-calendar-grid.tsx";
import { MonthCalendarGridBody } from "./month-calendar-grid-body.tsx";
import { MonthCalendarHeading } from "./month-calendar-heading.tsx";
import { MonthCalendarNextButton } from "./month-calendar-next-button.tsx";
import { MonthCalendarPrevButton } from "./month-calendar-prev-button.tsx";
import { MonthCalendarRoot } from "./month-calendar-root.tsx";
import { MonthCalendarRow } from "./month-calendar-row.tsx";

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
