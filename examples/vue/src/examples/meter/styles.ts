import { meter } from "examples-shared/recipes/meter";

// The example's classes: the Meter recipe (one string per part) and the stack.
export const styles = {
    ...meter,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
};
