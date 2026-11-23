import { rating } from "examples-shared/recipes/rating";

// The example's classes: the Rating recipe (its stars' outline and fill), the two rows, their
// labels and the notes beside them.
export const styles = {
    ...rating,
    stack: "flex flex-col items-start gap-4 font-primitives text-(length:--pr-size) text-palette-contrast",
    row: "flex flex-col items-start gap-1.5",
    label: "font-medium",
    note: "text-palette-accent/85",
};
