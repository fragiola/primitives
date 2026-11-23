import { aspectRatio } from "examples-shared/recipes/aspect-ratio";

// The example's classes: the AspectRatio recipe, the picture and the caption.
export const styles = {
    ...aspectRatio,
    figure: "m-0 flex w-full max-w-md flex-col gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    image: "size-full object-cover",
    caption: "text-palette-accent",
};
