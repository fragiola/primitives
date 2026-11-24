<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { ColorSlider } from "../../kit/ui/color-slider.ts";

// spec/color-slider.md, `/color-slider/vertical`
const value = ref<string>();
const onValue = (next: Color) => {
    value.value = formatColor(next, "hsb");
};
</script>

<template>
    <ColorSlider.Root
        channel="brightness"
        default-value="hsb(210, 50%, 30%)"
        orientation="vertical"
        locale="en-US"
        @value-change="onValue"
    >
        <ColorSlider.Track data-testid="track">
            <ColorSlider.Thumb aria-label="Brightness" />
        </ColorSlider.Track>
    </ColorSlider.Root>
    <Output :values="{ value }" />
</template>
