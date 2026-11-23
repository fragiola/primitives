import { carousel } from "examples-shared/recipes/carousel";

// The example's classes: the Carousel recipe and a feature card for each slide.
export const styles = {
    ...carousel,
    card: "flex h-40 flex-col justify-center gap-1 rounded-control border border-palette-line bg-palette-soft p-4",
    title: "text-base font-semibold",
    text: "text-palette-accent",
    tab: "h-(--pr-control-height) rounded-control px-3 font-medium text-palette-accent aria-selected:bg-palette-contrast aria-selected:text-palette-base",
};
