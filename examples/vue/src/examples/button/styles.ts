import { button } from "examples-shared/recipes/button";

// The example's classes: the Button recipe, the row of buttons and the status.
export const styles = {
    ...button,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    row: "flex items-center gap-2",
    status: "text-palette-accent/85",
};
