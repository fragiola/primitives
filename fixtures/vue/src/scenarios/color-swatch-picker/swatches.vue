<script setup lang="ts">
import { ColorSwatch } from "../../kit/ui/color-swatch.ts";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.ts";
import { SWATCHES, type Swatch } from "./swatches.ts";

// each swatch as an Item holding a ColorSwatch of its color
withDefaults(defineProps<{ swatches?: readonly Swatch[] }>(), {
    swatches: () => SWATCHES,
});
</script>

<template>
    <ColorSwatchPicker.Item
        v-for="swatch in swatches"
        :key="swatch.color"
        :value="swatch.color"
        :disabled="swatch.disabled"
    >
        <ColorSwatch :color="swatch.color" :aria-label="swatch.name" />
    </ColorSwatchPicker.Item>
</template>
