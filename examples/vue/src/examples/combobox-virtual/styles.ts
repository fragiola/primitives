import { combobox } from "examples-shared/recipes/combobox";

// The example's classes: the Combobox recipe (one string per part), its multi-word part under a
// name the markup can read without a string, a user's team beside the name, the label above the
// field and the line under it. A virtual list is its own scroll container
// (spec/virtual-lists.md): the list scrolls, at most 320 px high.
export const styles = {
    ...combobox,
    inputGroup: combobox["input-group"],
    list: `${combobox.list} max-h-80 overflow-y-auto`,
    team: "text-xs text-palette-accent/85",
    stack: "flex flex-col items-start gap-1 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
    result: "text-palette-accent",
};
