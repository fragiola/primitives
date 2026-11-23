import { scrollArea } from "examples-shared/recipes/scroll-area";

// The example's classes: the ScrollArea recipe (one string per part), the sidebar's box and its
// links.
export const styles = {
    ...scrollArea,
    sidebar:
        "h-64 w-56 font-primitives text-(length:--pr-size) text-palette-contrast",
    link: "block rounded-control px-2 py-1 text-palette-contrast no-underline outline-hidden hover:bg-palette-soft focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-palette-ring",
};
