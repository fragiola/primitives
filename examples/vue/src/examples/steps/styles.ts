import { FOCUS_RING } from "examples-shared/recipes/shared";
import { steps } from "examples-shared/recipes/steps";

// The example's classes: the Steps recipe, the shipping form and the review.
export const styles = {
    ...steps,
    label: "flex flex-col gap-1 text-palette-accent",
    input: `h-(--pr-control-height) rounded-control border border-palette-line bg-palette-base px-2 text-palette-contrast ${FOCUS_RING}`,
    text: "text-palette-accent",
};
