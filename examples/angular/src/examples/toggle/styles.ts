import { toggle } from "examples-shared/recipes/toggle";

// The example's classes: the Toggle recipe (one part), the track card, its title and status.
export const styles = {
    ...toggle,
    card: "flex flex-col items-start gap-3 font-primitives text-(length:--pr-size) text-palette-contrast",
    title: "font-semibold",
    subtitle: "text-palette-accent/85",
    actions: "flex flex-wrap items-center gap-2",
    status: "text-palette-accent/85",
};
