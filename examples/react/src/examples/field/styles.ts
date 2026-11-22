import { field } from "examples-shared/recipes/field";

// The example's classes: the Field recipe (one string per part), the form and its button.
export const styles = {
    ...field,
    form: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size)",
    submit: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
};
