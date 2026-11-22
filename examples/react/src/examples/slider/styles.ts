import { slider } from "examples-shared/recipes/slider";

// The example's classes: the Slider recipe (one string per part), and the two rows.
export const styles = {
    ...slider,
    stack: "flex flex-col gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    row: "flex flex-col gap-1",
    label: "font-medium",
};
