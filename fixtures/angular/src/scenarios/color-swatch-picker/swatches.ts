/** A swatch of the scenarios: its name, its color, and whether it is disabled. */
export interface Swatch {
    name: string;
    color: string;
    disabled?: boolean;
}

/** The swatches of spec/color-swatch-picker.md, "Scenarios". */
export const SWATCHES: readonly Swatch[] = [
    { name: "Red", color: "#ff0000" },
    { name: "Orange", color: "#ff8000" },
    { name: "Yellow", color: "#ffff00" },
    { name: "Green", color: "#00ff00" },
    { name: "Cyan", color: "#00ffff" },
    { name: "Blue", color: "#0000ff" },
    { name: "Purple", color: "#8000ff" },
    { name: "Gray", color: "#808080", disabled: true },
];
