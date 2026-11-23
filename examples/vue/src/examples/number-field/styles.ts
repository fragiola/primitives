import { label } from "examples-shared/recipes/label";
import { numberField } from "examples-shared/recipes/number-field";

// The example's classes: the NumberField recipe (one string per part), the Label's, and the
// stack the two fields sit in.
export const styles = {
    ...numberField,
    label: label.root,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
};
