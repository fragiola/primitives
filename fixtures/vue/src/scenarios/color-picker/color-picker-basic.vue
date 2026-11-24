<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorArea } from "../../kit/ui/color-area.ts";
import { ColorField } from "../../kit/ui/color-field.ts";
import { ColorPicker } from "../../kit/ui/color-picker.ts";
import { ColorSlider } from "../../kit/ui/color-slider.ts";
import { ColorSwatch } from "../../kit/ui/color-swatch.ts";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.ts";
import Swatches from "../color-swatch-picker/swatches.vue";

// spec/color-picker.md, `/color-picker/basic`: one color shared by the controls inside it.
const PRESETS = [
    { name: "Red", color: "#ff0000" },
    { name: "Green", color: "#00ff00" },
    { name: "Blue", color: "#0000ff" },
];
const value = ref<string>();
const space = ref<string>();
const committed = ref<string>();
const format = ref<string>();
const own = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValueChange = (next: Color) => {
    value.value = formatColor(next, "hex");
    space.value = next.space;
};
const onValueCommit = (next: Color) => {
    committed.value = formatColor(next, "hex");
};
const onFormatChange = (next: string) => {
    format.value = next;
};
const onOwnChange = (next: Color) => {
    own.value = formatColor(next);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <ColorPicker.Root
            aria-label="Theme color"
            default-value="hsb(210, 50%, 60%)"
            name="color"
            @value-change="onValueChange"
            @value-commit="onValueCommit"
            @format-change="onFormatChange"
        >
            <ColorArea.Root x-channel="saturation" y-channel="brightness" locale="en-US">
                <ColorArea.Thumb>
                    <ColorArea.Input axis="x" aria-label="Saturation" />
                    <ColorArea.Input axis="y" aria-label="Brightness" />
                </ColorArea.Thumb>
            </ColorArea.Root>
            <ColorSlider.Root channel="hue" locale="en-US">
                <ColorSlider.Track>
                    <ColorSlider.Thumb aria-label="Hue" />
                </ColorSlider.Track>
            </ColorSlider.Root>
            <ColorSlider.Root channel="alpha" locale="en-US">
                <ColorSlider.Track>
                    <ColorSlider.Thumb aria-label="Opacity" />
                </ColorSlider.Track>
            </ColorSlider.Root>
            <ColorField.Root>
                <ColorField.Input aria-label="Hex" />
            </ColorField.Root>
            <ColorSwatch aria-label="Current color" />
            <ColorSwatchPicker.Root aria-label="Presets">
                <Swatches :swatches="PRESETS" />
            </ColorSwatchPicker.Root>
            <ColorPicker.FormatSelect aria-label="Format">
                <option value="hex">Hex</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
                <option value="hsb">HSB</option>
            </ColorPicker.FormatSelect>
            <ColorPicker.EyeDropperTrigger>Pick a color</ColorPicker.EyeDropperTrigger>
            <ColorSlider.Root
                channel="hue"
                default-value="hsl(0, 100%, 50%)"
                locale="en-US"
                @value-change="onOwnChange"
            >
                <ColorSlider.Track>
                    <ColorSlider.Thumb aria-label="Own hue" />
                </ColorSlider.Track>
            </ColorSlider.Root>
        </ColorPicker.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, space, committed, format, own, form }" />
</template>
