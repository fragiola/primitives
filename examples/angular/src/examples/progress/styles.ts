import { progress } from "examples-shared/recipes/progress";
import { BUTTON } from "examples-shared/recipes/shared";

// The example's classes: the Progress recipe (one string per part), the stack, the buttons'
// row and the neutral buttons.
export const styles = {
    ...progress,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    row: "flex items-center gap-2",
    button: BUTTON,
};
