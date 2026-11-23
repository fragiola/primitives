import { dateField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";

// The example's classes: the DateField recipe (one string per part), the Field recipe for its
// label, the list of the other zones and the ISO line.
export const styles = {
    ...dateField,
    field,
    example:
        "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    zones: "flex flex-col gap-1",
    row: "flex gap-4",
    zone: "w-16 font-medium",
    time: "tabular-nums",
    status: "text-palette-accent/85 tabular-nums",
};
