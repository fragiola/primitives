import { CalendarCell } from "../calendar/calendar-cell.ts";
import { CalendarGrid } from "../calendar/calendar-grid.ts";
import { CalendarGridBody } from "../calendar/calendar-grid-body.ts";
import { CalendarGridHeader } from "../calendar/calendar-grid-header.ts";
import { CalendarHeaderCell } from "../calendar/calendar-header-cell.ts";
import { CalendarHeading } from "../calendar/calendar-heading.ts";
import { CalendarNextButton } from "../calendar/calendar-next-button.ts";
import { CalendarPrevButton } from "../calendar/calendar-prev-button.ts";
import { CalendarRow } from "../calendar/calendar-row.ts";
import { MultipleCalendarRoot } from "./multiple-calendar-root.ts";

/** spec/calendar.md "Multiple dates": several dates, with the Calendar's parts (named `multiple-calendar-*`) */
export const MultipleCalendar = {
    Root: MultipleCalendarRoot,
    Heading: CalendarHeading,
    PrevButton: CalendarPrevButton,
    NextButton: CalendarNextButton,
    Grid: CalendarGrid,
    GridHeader: CalendarGridHeader,
    HeaderCell: CalendarHeaderCell,
    GridBody: CalendarGridBody,
    Row: CalendarRow,
    Cell: CalendarCell,
};
