import { segmentedControl } from "examples-shared/recipes/segmented-control";

// The example's classes: the SegmentedControl recipe (one string per part), its multi-word part
// under a name the markup can read without a string, the label, and the projects laid out by the
// view (`data-view`).
export const styles = {
    ...segmentedControl,
    itemText: segmentedControl["item-text"],
    stack: "flex w-80 flex-col items-start gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
    projects:
        "grid w-full gap-2 data-[view=list]:grid-cols-1 data-[view=grid]:grid-cols-3 data-[view=board]:grid-flow-col data-[view=board]:grid-rows-2",
    project:
        "rounded-control border border-palette-line px-3 py-2 in-data-[view=grid]:py-4 in-data-[view=board]:py-6",
};
