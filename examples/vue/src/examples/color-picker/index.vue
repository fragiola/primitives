<script setup lang="ts">
import {
    type Color,
    type ColorChannel,
    formatColor,
} from "@fragiola/primitives/color";
import { ColorArea } from "@fragiola/primitives-vue/color-area";
import { ColorField } from "@fragiola/primitives-vue/color-field";
import {
    ColorPicker,
    type ColorPickerFormat,
} from "@fragiola/primitives-vue/color-picker";
import { ColorPickerPopover } from "@fragiola/primitives-vue/color-picker-popover";
import { ColorSlider } from "@fragiola/primitives-vue/color-slider";
import { ColorSwatch } from "@fragiola/primitives-vue/color-swatch";
import { ColorSwatchPicker } from "@fragiola/primitives-vue/color-swatch-picker";
import { ref, shallowRef } from "vue";
import { styles } from "./styles.ts";

const VIOLET: Color = {
    space: "rgb",
    red: 124,
    green: 58,
    blue: 237,
    alpha: 1,
};

const PRESETS = [
    { name: "Violet", color: "#7c3aed" },
    { name: "Blue", color: "#2563eb" },
    { name: "Teal", color: "#0d9488" },
    { name: "Green", color: "#16a34a" },
    { name: "Amber", color: "#d97706" },
    { name: "Red", color: "#dc2626" },
    { name: "Pink", color: "#db2777" },
    { name: "Slate", color: "#475569" },
];

/** The channel fields of each format, with their names (the app's: spec/color.md, "Channels"). */
const CHANNELS: Record<
    Exclude<ColorPickerFormat, "hex">,
    readonly [ColorChannel, string][]
> = {
    rgb: [
        ["red", "Red"],
        ["green", "Green"],
        ["blue", "Blue"],
    ],
    hsl: [
        ["hue", "Hue"],
        ["saturation", "Saturation"],
        ["lightness", "Lightness"],
    ],
    hsb: [
        ["hue", "Hue"],
        ["saturation", "Saturation"],
        ["brightness", "Brightness"],
    ],
};

// A theme color picker (spec/color-picker.md): the picker holds one color, every control inside
// its popup is bound to it (none is given a value of its own), and the format select chooses which
// fields edit it. The trigger shows the color; the preview uses the picker's CSS variable.
const color = shallowRef<Color>(VIOLET);
const format = ref<ColorPickerFormat>("hex");
</script>

<template>
    <ColorPicker.Root v-model:value="color" v-model:format="format" :class="styles.picker.root">
        <div :class="styles.row">
            <ColorPickerPopover.Root>
                <ColorPickerPopover.Trigger :class="styles.popover.trigger">
                    <ColorSwatch aria-hidden="true" :class="styles.swatch.root" />
                    <span :class="styles.label">Theme color</span>
                    <span :class="styles.hex">{{ formatColor(color, "hex") }}</span>
                </ColorPickerPopover.Trigger>
                <ColorPickerPopover.Portal>
                    <ColorPickerPopover.Positioner :side-offset="8" :class="styles.popover.positioner">
                        <ColorPickerPopover.Popup aria-label="Theme color picker" :class="styles.popover.popup">
                            <div :class="styles.columns">
                                <div :class="styles.column">
                                    <ColorArea.Root x-channel="saturation" y-channel="brightness" :class="styles.area.root">
                                        <ColorArea.Thumb :class="styles.area.thumb">
                                            <ColorArea.Input axis="x" aria-label="Saturation" />
                                            <ColorArea.Input axis="y" aria-label="Brightness" />
                                        </ColorArea.Thumb>
                                    </ColorArea.Root>
                                    <ColorSlider.Root channel="hue" :class="styles.slider.root">
                                        <ColorSlider.Track :class="styles.slider.track">
                                            <ColorSlider.Thumb aria-label="Hue" :class="styles.slider.thumb" />
                                        </ColorSlider.Track>
                                    </ColorSlider.Root>
                                    <ColorSlider.Root channel="alpha" :class="styles.slider.root">
                                        <ColorSlider.Track :class="styles.slider.track">
                                            <ColorSlider.Thumb aria-label="Opacity" :class="styles.slider.thumb" />
                                        </ColorSlider.Track>
                                    </ColorSlider.Root>
                                </div>
                                <div :class="styles.column">
                                    <div :class="styles.row">
                                        <ColorPicker.FormatSelect aria-label="Format" :class="styles.formatSelect">
                                            <option value="hex">Hex</option>
                                            <option value="rgb">RGB</option>
                                            <option value="hsl">HSL</option>
                                            <option value="hsb">HSB</option>
                                        </ColorPicker.FormatSelect>
                                        <ColorField.Root v-if="format === 'hex'" :class="styles.field.root">
                                            <ColorField.Input aria-label="Hex" :class="styles.field.input" />
                                        </ColorField.Root>
                                        <div v-else :class="styles.channels">
                                            <ColorField.Root
                                                v-for="[channel, name] in CHANNELS[format]"
                                                :key="channel"
                                                :channel="channel"
                                                :color-space="format"
                                                :class="styles.field.root"
                                            >
                                                <ColorField.Input
                                                    :aria-label="name"
                                                    :class="styles.channelInput"
                                                />
                                            </ColorField.Root>
                                        </div>
                                    </div>
                                    <ColorSwatchPicker.Root aria-label="Presets" :class="styles.swatches.root">
                                        <ColorSwatchPicker.Item
                                            v-for="preset in PRESETS"
                                            :key="preset.color"
                                            :value="preset.color"
                                            :class="styles.swatches.item"
                                        >
                                            <ColorSwatch :color="preset.color" :aria-label="preset.name" :class="styles.swatch.root" />
                                        </ColorSwatchPicker.Item>
                                    </ColorSwatchPicker.Root>
                                    <ColorPicker.EyeDropperTrigger :class="styles.eyeDropper">
                                        Pick from the screen
                                    </ColorPicker.EyeDropperTrigger>
                                </div>
                            </div>
                        </ColorPickerPopover.Popup>
                    </ColorPickerPopover.Positioner>
                </ColorPickerPopover.Portal>
            </ColorPickerPopover.Root>
        </div>
        <div :class="styles.preview">Preview</div>
    </ColorPicker.Root>
</template>
