import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";

// The example's classes: the DateField recipe for each end's Input and segments, the range's own
// (the two ends side by side, the separator), the Field recipe for its label and errors, the
// form, its button and its status line.
export const styles = {
    ...dateField,
    ...dateRangeField,
    field,
    form: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    submit: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    status: "text-palette-accent/85",
};
