import { checkbox } from "examples-shared/recipes/checkbox";
import { field } from "examples-shared/recipes/field";
import { fieldset } from "examples-shared/recipes/fieldset";

// The example's classes: the Fieldset recipe for the two groups, the Field recipe for their
// fields, the Checkbox recipe for "Billing same as shipping", the form, its button and its status.
export const styles = {
    fieldset,
    field,
    checkbox: {
        ...checkbox,
        indicator: `${checkbox.indicator} after:content-['✓']`,
    },
    form: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    row: "flex items-center gap-2",
    submit: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    status: "text-palette-accent/85",
};
