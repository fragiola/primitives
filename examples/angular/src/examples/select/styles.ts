import { select } from "examples-shared/recipes/select";

// The example's classes: the Select recipe (one string per part), its item indicator under a
// name the markup can read without a string, and the label above it.
export const styles = {
    ...select,
    itemIndicator: select["item-indicator"],
    stack: "flex flex-col items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
};
