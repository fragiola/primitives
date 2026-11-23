import { CalendarCell } from "../calendar/calendar-cell.tsx";
import { CalendarGrid } from "../calendar/calendar-grid.tsx";
import { CalendarGridBody } from "../calendar/calendar-grid-body.tsx";
import { CalendarGridHeader } from "../calendar/calendar-grid-header.tsx";
import { CalendarHeaderCell } from "../calendar/calendar-header-cell.tsx";
import { CalendarHeading } from "../calendar/calendar-heading.tsx";
import { CalendarNextButton } from "../calendar/calendar-next-button.tsx";
import { CalendarPrevButton } from "../calendar/calendar-prev-button.tsx";
import { CalendarRow } from "../calendar/calendar-row.tsx";
import { MultipleCalendarRoot } from "./multiple-calendar-root.tsx";

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
