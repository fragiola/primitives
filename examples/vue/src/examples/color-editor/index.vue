<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ColorArea } from "@fragiola/primitives-vue/color-area";
import { ColorField } from "@fragiola/primitives-vue/color-field";
import { ColorSlider } from "@fragiola/primitives-vue/color-slider";
import { ColorWheel } from "@fragiola/primitives-vue/color-wheel";
import { computed, shallowRef } from "vue";
import { styles } from "./styles.ts";

const INITIAL: Color = {
    space: "hsl",
    hue: 210,
    saturation: 80,
    lightness: 50,
    alpha: 1,
};

// An HSL editor: one color value shared by four controls (spec/color.md). The wheel picks the hue,
// the area its saturation and lightness, the slider its opacity, and the field reads and writes
// it as hex (Enter or leaving the field commits a typed color; an emptied field keeps the color).
// Each control reports the color in its own space; the swatch shows it.
const color = shallowRef<Color>(INITIAL);
const css = computed(() => formatColor(color.value, "css"));
const onFieldChange = (next: Color | null) => {
    if (next !== null) color.value = next;
};
</script>

<template>
    <div :class="styles.stack">
        <div :class="styles.row">
            <ColorWheel.Root
                v-model:value="color"
                color-space="hsl"
                :outer-radius="80"
                :inner-radius="60"
                locale="en-US"
                :class="styles.wheel.root"
            >
                <ColorWheel.Track :class="styles.wheel.track" />
                <ColorWheel.Thumb aria-label="Hue" :class="styles.wheel.thumb" />
            </ColorWheel.Root>
            <ColorArea.Root
                v-model:value="color"
                color-space="hsl"
                x-channel="saturation"
                y-channel="lightness"
                locale="en-US"
                aria-label="Saturation and lightness"
                :class="styles.area.root"
            >
                <ColorArea.Thumb :class="styles.area.thumb">
                    <ColorArea.Input axis="x" aria-label="Saturation" />
                    <ColorArea.Input axis="y" aria-label="Lightness" />
                </ColorArea.Thumb>
            </ColorArea.Root>
        </div>
        <ColorSlider.Root v-model:value="color" channel="alpha" locale="en-US" :class="styles.slider.root">
            <ColorSlider.Label :class="styles.slider.label">Opacity</ColorSlider.Label>
            <ColorSlider.Track :class="styles.slider.track">
                <ColorSlider.Thumb :class="styles.slider.thumb" />
            </ColorSlider.Track>
            <ColorSlider.Output :class="styles.slider.output" />
        </ColorSlider.Root>
        <div :class="styles.fieldRow">
            <label for="color-hex" :class="styles.label">Hex</label>
            <ColorField.Root id="color-hex" :value="color" :class="styles.field.root" @value-change="onFieldChange">
                <ColorField.Input :class="styles.field.input" />
            </ColorField.Root>
            <div :class="styles.swatch" :style="{ '--swatch': css }" />
            <output :class="styles.value">{{ css }}</output>
        </div>
    </div>
</template>
