import { calendar, calendarPreset } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";

// The example's classes: the DatePicker recipe for the trigger and popup, the Calendar recipe for
// the grid inside and its presets, the page and the header row.
export const styles = {
    picker: datePicker,
    preset: calendarPreset,
    calendar: {
        ...calendar,
        prevButton: calendar["prev-button"],
        nextButton: calendar["next-button"],
        headerCell: calendar["header-cell"],
    },
    page: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    header: "flex items-center justify-between gap-2",
};
