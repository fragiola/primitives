import { calendar } from "examples-shared/recipes/calendar";

// The example's classes: the Calendar recipe (one string per part, the RangeCalendar shares
// them), the two months side by side and the summary under them.
export const styles = {
    ...calendar,
    prevButton: calendar["prev-button"],
    nextButton: calendar["next-button"],
    headerCell: calendar["header-cell"],
    months: "flex flex-wrap gap-6",
    month: "flex flex-col gap-2",
    header: "flex items-center justify-between gap-2",
    spacer: "size-(--pr-control-height)",
    status: "text-palette-accent/85",
};
