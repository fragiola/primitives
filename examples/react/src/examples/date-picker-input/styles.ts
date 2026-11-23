import { calendar } from "examples-shared/recipes/calendar";
import { dateField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";

// The example's classes: the DateField recipe for the typed segments, the typed picker's own (the
// segments and the calendar button side by side), the DatePicker recipe for the popup, the
// Calendar recipe for the grid inside, the Field recipe for its label and error, the form, its
// header row and its button.
export const styles = {
    ...dateField,
    typed: datePickerInput,
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
