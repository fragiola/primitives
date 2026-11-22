import { CalendarCell } from "./calendar-cell.ts";
import { CalendarGrid } from "./calendar-grid.ts";
import { CalendarGridBody } from "./calendar-grid-body.ts";
import { CalendarGridHeader } from "./calendar-grid-header.ts";
import { CalendarHeaderCell } from "./calendar-header-cell.ts";
import { CalendarHeading } from "./calendar-heading.ts";
import { CalendarNextButton } from "./calendar-next-button.ts";
import { CalendarPrevButton } from "./calendar-prev-button.ts";
import { CalendarRoot } from "./calendar-root.ts";
import { CalendarRow } from "./calendar-row.ts";

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
