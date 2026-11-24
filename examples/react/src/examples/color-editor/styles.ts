import { colorArea } from "examples-shared/recipes/color-area";
import { colorField } from "examples-shared/recipes/color-field";
import { colorSlider } from "examples-shared/recipes/color-slider";
import { colorWheel } from "examples-shared/recipes/color-wheel";

// The example's classes: the four color recipes (their gradients and thumbs drawn from the parts'
// CSS variables), the layout, the swatch with a checkerboard under its color, and the labels.
export const styles = {
    area: colorArea,
    wheel: colorWheel,
    slider: colorSlider,
    field: colorField,
    stack: "flex flex-col items-start gap-4 font-primitives text-(length:--pr-size) text-palette-contrast",
    row: "flex flex-wrap items-center gap-6",
    label: "font-medium",
    fieldRow: "flex items-center gap-3",
    swatch: "size-10 rounded-control border border-palette-line bg-[repeating-conic-gradient(#d4d4d8_0%_25%,#ffffff_0%_50%)_50%/12px_12px] [box-shadow:inset_0_0_0_100px_var(--swatch)]",
    value: "tabular-nums text-palette-accent",
};
