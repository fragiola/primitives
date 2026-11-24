<script setup lang="ts">
import { ColorField } from "../../kit/ui/color-field.ts";
import { ColorPicker, ColorPickerPopover } from "../../kit/ui/color-picker.ts";
import { ColorSlider } from "../../kit/ui/color-slider.ts";
import { ColorSwatch } from "../../kit/ui/color-swatch.ts";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.ts";
import Swatches from "../color-swatch-picker/swatches.vue";

// spec/color-picker.md, `/color-picker/disabled`
// one root element: the app's `locale` is no attribute of it (React's page has none)
defineOptions({ inheritAttrs: false });
const PRESETS = [
    { name: "Red", color: "#ff0000" },
    { name: "Green", color: "#00ff00" },
];
</script>

<template>
    <ColorPicker.Root disabled default-value="#336699">
        <ColorSlider.Root channel="hue" locale="en-US">
            <ColorSlider.Track>
                <ColorSlider.Thumb aria-label="Hue" />
            </ColorSlider.Track>
        </ColorSlider.Root>
        <ColorSwatchPicker.Root aria-label="Presets">
            <Swatches :swatches="PRESETS" />
        </ColorSwatchPicker.Root>
        <ColorPicker.FormatSelect aria-label="Format">
            <option value="hex">Hex</option>
            <option value="rgb">RGB</option>
        </ColorPicker.FormatSelect>
        <ColorPicker.EyeDropperTrigger>Pick a color</ColorPicker.EyeDropperTrigger>
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
</template>
