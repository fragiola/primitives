import { autocomplete } from "examples-shared/recipes/autocomplete";

// The example's classes: the Autocomplete recipe (one string per part), its multi-word part under
// a name the markup can read without a string, the label above it and the search's result line.
export const styles = {
    ...autocomplete,
    inputGroup: autocomplete["input-group"],
    stack: "flex flex-col items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
    result: "text-palette-accent",
};
