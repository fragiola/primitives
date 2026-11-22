import { drawer } from "examples-shared/recipes/drawer";

// The example's classes: the Drawer recipe at the right edge, and the cart's rows.
export const styles = {
    ...drawer,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    items: "flex flex-1 flex-col gap-2",
    item: "flex items-center justify-between gap-2 rounded-control border border-palette-line p-2",
    remove: drawer.close,
    empty: "text-palette-accent/85",
};
