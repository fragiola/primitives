import { field } from "examples-shared/recipes/field";
import { form } from "examples-shared/recipes/form";

// The example's classes: the Form recipe, the Field recipe (one string per part), the button and
// the status.
export const styles = {
    form: form.root,
    field,
    submit: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    status: "text-palette-accent/85",
};
