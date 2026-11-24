import { ColorField } from "../../kit/ui/color-field.tsx";
import { ColorPicker, ColorPickerPopover } from "../../kit/ui/color-picker.tsx";
import { ColorSlider } from "../../kit/ui/color-slider.tsx";
import { ColorSwatch } from "../../kit/ui/color-swatch.tsx";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.tsx";
import { Swatches } from "../color-swatch-picker/swatches.tsx";

const PRESETS = [
    { name: "Red", color: "#ff0000" },
    { name: "Green", color: "#00ff00" },
];

/** spec/color-picker.md, `/color-picker/disabled` */
export function ColorPickerDisabled() {
    return (
        <ColorPicker.Root disabled defaultValue="#336699">
            <ColorSlider.Root channel="hue" locale="en-US">
                <ColorSlider.Track>
                    <ColorSlider.Thumb aria-label="Hue" />
                </ColorSlider.Track>
            </ColorSlider.Root>
            <ColorSwatchPicker.Root aria-label="Presets">
                <Swatches swatches={PRESETS} />
            </ColorSwatchPicker.Root>
            <ColorPicker.FormatSelect aria-label="Format">
                <option value="hex">Hex</option>
                <option value="rgb">RGB</option>
            </ColorPicker.FormatSelect>
            <ColorPicker.EyeDropperTrigger>
                Pick a color
            </ColorPicker.EyeDropperTrigger>
            <ColorPickerPopover.Root>
                <ColorPickerPopover.Trigger aria-label="Open picker">
                    <ColorSwatch />
                </ColorPickerPopover.Trigger>
                <ColorPickerPopover.Portal>
                    <ColorPickerPopover.Positioner>
                        <ColorPickerPopover.Popup aria-label="Picker">
                            <ColorField.Root>
                                <ColorField.Input aria-label="Hex" />
                            </ColorField.Root>
                        </ColorPickerPopover.Popup>
                    </ColorPickerPopover.Positioner>
                </ColorPickerPopover.Portal>
            </ColorPickerPopover.Root>
        </ColorPicker.Root>
    );
}
