import { combobox } from "examples-shared/recipes/combobox";

// The example's classes: the Combobox recipe (one string per part), its multi-word parts under
// names the markup can read without a string, and the label above it.
export const styles = {
    ...combobox,
    chipRemove: combobox["chip-remove"],
    itemIndicator: combobox["item-indicator"],
    stack: "flex flex-col items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
};
