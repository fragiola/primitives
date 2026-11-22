import { CalendarCell } from "./calendar-cell.tsx";
import { CalendarGrid } from "./calendar-grid.tsx";
import { CalendarGridBody } from "./calendar-grid-body.tsx";
import { CalendarGridHeader } from "./calendar-grid-header.tsx";
import { CalendarHeaderCell } from "./calendar-header-cell.tsx";
import { CalendarHeading } from "./calendar-heading.tsx";
import { CalendarNextButton } from "./calendar-next-button.tsx";
import { CalendarPrevButton } from "./calendar-prev-button.tsx";
import { CalendarRoot } from "./calendar-root.tsx";
import { CalendarRow } from "./calendar-row.tsx";

/** spec/calendar.md: one date */
export const Calendar = {
    Root: CalendarRoot,
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
