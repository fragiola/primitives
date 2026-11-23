import { editable } from "examples-shared/recipes/editable";

// The example's classes: the Editable recipe (one string per part), its triggers under names the
// markup can read without a string, the label and the line that says what was saved.
export const styles = {
    ...editable,
    editTrigger: editable["edit-trigger"],
    submitTrigger: editable["submit-trigger"],
    cancelTrigger: editable["cancel-trigger"],
    icon: "size-4",
    stack: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
    status: "min-h-5 text-palette-accent/85",
};
