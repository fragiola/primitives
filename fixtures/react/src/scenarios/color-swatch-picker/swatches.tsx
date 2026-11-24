import { ColorSwatch } from "../../kit/ui/color-swatch.tsx";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.tsx";

/** The swatches of spec/color-swatch-picker.md, "Scenarios". */
export const SWATCHES = [
    { name: "Red", color: "#ff0000" },
    { name: "Orange", color: "#ff8000" },
    { name: "Yellow", color: "#ffff00" },
    { name: "Green", color: "#00ff00" },
    { name: "Cyan", color: "#00ffff" },
    { name: "Blue", color: "#0000ff" },
    { name: "Purple", color: "#8000ff" },
    { name: "Gray", color: "#808080", disabled: true },
];

/** Each swatch as an Item holding a ColorSwatch of its color. */
export function Swatches({
    swatches = SWATCHES,
}: {
    swatches?: readonly { name: string; color: string; disabled?: boolean }[];
}) {
    return swatches.map((swatch) => (
        <ColorSwatchPicker.Item
            key={swatch.color}
            value={swatch.color}
            disabled={swatch.disabled}
        >
            <ColorSwatch color={swatch.color} aria-label={swatch.name} />
        </ColorSwatchPicker.Item>
    ));
}
