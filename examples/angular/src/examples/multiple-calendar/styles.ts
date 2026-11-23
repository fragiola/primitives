import { calendar } from "examples-shared/recipes/calendar";

// The example's classes: the Calendar recipe for the grid (a MultipleCalendar has the Calendar's
// parts), the form, its header row, its hint and its button.
export const styles = {
    calendar: {
        ...calendar,
        prevButton: calendar["prev-button"],
        nextButton: calendar["next-button"],
        headerCell: calendar["header-cell"],
    },
    form: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    header: "flex items-center justify-between gap-2",
    hint: "text-palette-accent/85",
    submit: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    status: "text-palette-accent/85",
};
