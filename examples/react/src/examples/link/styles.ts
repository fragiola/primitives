import { link } from "examples-shared/recipes/link";

// The example's classes: the Link recipe, the sidebar and the page beside it.
export const styles = {
    ...link,
    layout: "flex gap-6 font-primitives text-(length:--pr-size) text-palette-contrast",
    nav: "w-40 shrink-0",
    links: "flex flex-col items-start gap-2",
    page: "flex flex-col gap-2",
    heading: "text-lg font-semibold",
    text: "text-palette-accent",
};
