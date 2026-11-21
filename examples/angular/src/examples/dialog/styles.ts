import { dialog } from "examples-shared/recipes/dialog";

// The example's classes: the Dialog recipe (one string per part), and the form inside it.
export const styles = {
    ...dialog,
    form: "flex flex-col gap-(--pr-gap)",
    field: "flex flex-col gap-1 font-medium",
    input: "h-(--pr-control-height) px-2 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-normal outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-palette-ring",
    actions: "flex justify-end gap-2",
};
