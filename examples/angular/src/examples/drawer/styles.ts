import { drawer } from "examples-shared/recipes/drawer";

// The example's classes: the Drawer recipe (one string per part, and the handle a mouse swipes
// from), the share targets and the status line.
export const styles = {
    ...drawer,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    status: "text-palette-accent/85",
    targets: "grid grid-cols-3 gap-2",
    target: drawer.close,
};
