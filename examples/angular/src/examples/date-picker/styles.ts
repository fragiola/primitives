import { calendar } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";

// The example's classes: the DatePicker recipe for the trigger and popup, the Calendar recipe
// for the grid inside, the Field recipe around the picker, the form, its header row and its button.
export const styles = {
    picker: datePicker,
    field,
    calendar: {
        ...calendar,
        prevButton: calendar["prev-button"],
        nextButton: calendar["next-button"],
        headerCell: calendar["header-cell"],
    },
    form: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    header: "flex items-center justify-between gap-2",
    submit: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    status: "text-palette-accent/85",
};
