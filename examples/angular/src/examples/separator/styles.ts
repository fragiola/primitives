import { separator } from "examples-shared/recipes/separator";
import { FOCUS_RING } from "examples-shared/recipes/shared";

// The example's classes: the Separator recipe, the card, its heading, its text and its row of
// links.
export const styles = {
    ...separator,
    card: "flex w-72 flex-col gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    heading: "font-semibold",
    text: "text-palette-accent/85",
    row: "flex items-center gap-3",
    link: `rounded-control underline-offset-4 hover:underline ${FOCUS_RING}`,
};
