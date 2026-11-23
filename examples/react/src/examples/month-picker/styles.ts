import { calendar } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { monthCalendar } from "examples-shared/recipes/month-calendar";

// The example's classes: the DatePicker recipe for the trigger and popup (a MonthPicker has its
// parts), the MonthCalendar recipe for the grid inside with the Calendar recipe's root, heading
// and buttons, the Field recipe for its label and error, the form, its header row and its button.
export const styles = {
    picker: datePicker,
    field,
    calendar: {
        ...monthCalendar,
        root: calendar.root,
        heading: calendar.heading,
        prevButton: calendar["prev-button"],
        nextButton: calendar["next-button"],
    },
    form: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    header: "flex items-center justify-between gap-2",
    submit: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    status: "text-palette-accent/85",
};
