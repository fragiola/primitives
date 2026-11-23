import { searchField } from "examples-shared/recipes/search-field";

// The example's classes: the SearchField recipe (one string per part), its button under a name the
// markup can read without a string, the label, the list of results and the message.
export const styles = {
    ...searchField,
    clearButton: searchField["clear-button"],
    stack: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
    list: "flex w-64 flex-col gap-1 ps-1",
    status: "min-h-5 text-palette-accent/85",
};
