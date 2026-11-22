<script setup lang="ts">
import { Slider } from "@fragiola/primitives-vue/slider";
import { styles } from "./styles.ts";

const price = (value: number) => `$${value}`;

// A volume and a price range: drag a thumb or press the track; the arrows step, Page Up and
// Page Down jump by ten, Home and End go to the bounds, and the price thumbs stay ten apart
// (spec/slider.md).
</script>

<template>
    <div :class="styles.stack">
        <div :class="styles.row">
            <span id="volume" :class="styles.label">Volume</span>
            <Slider.Root :default-value="50" :class="styles.root">
                <Slider.Control :class="styles.control">
                    <Slider.Track :class="styles.track"><Slider.Indicator :class="styles.indicator" /></Slider.Track>
                    <Slider.Thumb aria-labelledby="volume" :class="styles.thumb" />
                </Slider.Control>
            </Slider.Root>
        </div>
        <div :class="styles.row">
            <span :class="styles.label">Price</span>
            <Slider.Root :default-value="[20, 80]" :min-steps-between-values="10" :class="styles.root">
                <Slider.Control :class="styles.control">
                    <Slider.Track :class="styles.track"><Slider.Indicator :class="styles.indicator" /></Slider.Track>
                    <Slider.Thumb aria-label="Minimum price" :get-aria-value-text="price" :class="styles.thumb" />
                    <Slider.Thumb aria-label="Maximum price" :get-aria-value-text="price" :class="styles.thumb" />
                </Slider.Control>
            </Slider.Root>
        </div>
    </div>
</template>
