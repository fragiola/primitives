import { alertDialog } from "examples-shared/recipes/alert-dialog";

// The example's classes: the AlertDialog recipe (one string per part, and its destructive
// action), and the draft it guards.
export const styles = {
    ...alertDialog,
    stack: "flex w-72 flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    field: "flex w-full flex-col gap-1 font-medium",
    textarea:
        "h-24 w-full resize-none rounded-control border border-palette-line bg-palette-base p-2 font-normal text-palette-contrast outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-palette-ring",
};
