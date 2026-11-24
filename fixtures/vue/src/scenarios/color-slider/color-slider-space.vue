<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref, shallowRef } from "vue";
import Output from "../../kit/output.vue";
import { ColorSlider } from "../../kit/ui/color-slider.ts";

// spec/color-slider.md, `/color-slider/space`: three sliders on one value, in two spaces.
const color = shallowRef<Color | string>("#336699");
const value = ref<string>();
const onValueChange = (next: Color) => {
    color.value = next;
    value.value = formatColor(next);
};
</script>

<template>
    <div class="flex flex-col items-start gap-2">
        <ColorSlider.Root channel="red" :value="color" locale="en-US" @value-change="onValueChange">
            <ColorSlider.Track>
                <ColorSlider.Thumb aria-label="Red" />
            </ColorSlider.Track>
        </ColorSlider.Root>
        <ColorSlider.Root channel="hue" color-space="hsl" :value="color" locale="en-US" @value-change="onValueChange">
            <ColorSlider.Track>
                <ColorSlider.Thumb aria-label="Hue" />
            </ColorSlider.Track>
        </ColorSlider.Root>
        <ColorSlider.Root channel="lightness" :value="color" locale="en-US" @value-change="onValueChange">
            <ColorSlider.Track>
                <ColorSlider.Thumb aria-label="Lightness" />
            </ColorSlider.Track>
        </ColorSlider.Root>
    </div>
    <Output :values="{ value }" />
</template>
