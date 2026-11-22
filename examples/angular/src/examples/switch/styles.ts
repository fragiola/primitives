import { switchControl } from "examples-shared/recipes/switch";

// The example's classes: the Switch recipe (one string per part), the list and its rows.
export const styles = {
    ...switchControl,
    list: "flex flex-col items-start gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    row: "flex items-center gap-2",
};
