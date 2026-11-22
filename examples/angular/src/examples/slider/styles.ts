import { slider } from "examples-shared/recipes/slider";

// The example's classes: the Slider recipe (one string per part, its Label and Value too), and the
// stack of the two sliders.
export const styles = {
    ...slider,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
};
