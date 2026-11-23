import { calendar } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { monthCalendar } from "examples-shared/recipes/month-calendar";

// The example's classes: the DatePicker recipe for the trigger and popup (a YearRangePicker has
// its parts), the MonthCalendar recipe for the year grid with the Calendar recipe's root, heading
// and buttons, the filter row, the list and its button.
export const styles = {
    picker: datePicker,
    calendar: {
        ...monthCalendar,
        root: calendar.root,
        heading: calendar.heading,
        prevButton: calendar["prev-button"],
        nextButton: calendar["next-button"],
    },
    page: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    filter: "flex items-center gap-2",
    header: "flex items-center justify-between gap-2",
    clear: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    list: "flex flex-col gap-1",
    item: "flex gap-2",
    year: "tabular-nums text-palette-accent/85",
};
