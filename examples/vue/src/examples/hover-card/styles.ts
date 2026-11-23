import { hoverCard } from "examples-shared/recipes/hover-card";

// The example's classes: the HoverCard recipe (one string per part), and the profile in the card.
export const styles = {
    ...hoverCard,
    text: "font-primitives text-(length:--pr-size) text-palette-contrast",
    header: "flex items-center gap-3",
    avatar: "flex size-10 shrink-0 items-center justify-center rounded-full bg-palette-soft font-semibold",
    name: "font-semibold",
    handle: "text-palette-accent/85",
    bio: "mt-2",
    stats: "mt-2 flex gap-4 text-palette-accent/85",
};
