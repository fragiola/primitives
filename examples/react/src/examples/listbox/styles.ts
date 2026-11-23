import { button } from "examples-shared/recipes/button";
import { listbox } from "examples-shared/recipes/listbox";

// The example's classes: the Listbox recipe (one string per part), its multi-word part under a
// name the markup can read without a string, the move buttons and the layout of the two lists.
export const styles = {
    ...listbox,
    itemIndicator: listbox["item-indicator"],
    button: button.root,
    row: "flex items-center gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    column: "flex flex-col gap-1",
    buttons: "flex flex-col gap-2",
    heading: "font-medium",
    list: `${listbox.root} h-56`,
};
