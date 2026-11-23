import { calendar } from "examples-shared/recipes/calendar";
import { dateField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";

// The example's classes: the Calendar recipe for the grid, the DateField recipe for the typed
// date, the Field recipe for its label, the right-to-left panel holding both, its header row and
// the ISO line under it.
export const styles = {
    calendar: {
        ...calendar,
        prevButton: calendar["prev-button"],
        nextButton: calendar["next-button"],
        headerCell: calendar["header-cell"],
    },
    dateField,
    field,
    example:
        "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    panel: "flex flex-wrap items-start gap-6",
    header: "flex items-center justify-between gap-2",
    status: "text-palette-accent/85 tabular-nums",
};
