import { navigationMenu } from "examples-shared/recipes/navigation-menu";

// The example's classes: the NavigationMenu recipe (one string per part, and the links inside a
// panel), plus each panel link's title and description.
export const styles = {
    ...navigationMenu,
    header: "flex w-full items-center gap-4 border-b border-palette-line pb-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    brand: "font-semibold",
    panel: "flex flex-col gap-0.5 w-64",
    grid: "grid grid-cols-2 gap-0.5 w-96",
    // the links inside a panel, under a name the markup reads without a string
    contentLink: navigationMenu["content-link"],
    linkTitle: "block font-medium",
    linkDescription: "block text-palette-accent/85",
};
