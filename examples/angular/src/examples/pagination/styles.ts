import { pagination } from "examples-shared/recipes/pagination";

// The example's classes: the Pagination recipe (one string per part) and the orders table.
export const styles = {
    ...pagination,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    table: "w-80 border-collapse text-start",
    cell: "border-b border-palette-line px-2 py-1 text-start",
    number: "border-b border-palette-line px-2 py-1 text-end tabular-nums",
};
