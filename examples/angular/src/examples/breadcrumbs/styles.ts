import { breadcrumbs } from "examples-shared/recipes/breadcrumbs";

// The example's classes: the Breadcrumbs recipe, the page under the trail and its child links.
export const styles = {
    ...breadcrumbs,
    stack: "flex flex-col items-start gap-4 font-primitives text-(length:--pr-size) text-palette-contrast",
    heading: "text-lg font-semibold",
    children: "flex flex-col gap-1",
    child: breadcrumbs.link,
};
