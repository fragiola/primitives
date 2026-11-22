<script setup lang="ts">
import { Slider } from "@fragiola/primitives-vue/slider";
import { styles } from "./styles.ts";

/** The price in US dollars: what the Value shows and the thumbs' `aria-valuetext`. */
const DOLLARS: Intl.NumberFormatOptions = {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
};

// A volume and a price range, each named by its label and showing its value: drag a thumb or
// press the track; the arrows step, Page Up and Page Down jump by ten, Home and End go to the
// bounds, and the price thumbs stay ten apart (spec/slider.md).
</script>

<template>
    <div :class="styles.stack">
        <Slider.Root :default-value="50" :class="styles.root">
            <Slider.Label :class="styles.label">Volume</Slider.Label>
            <Slider.Control :class="styles.control">
                <Slider.Track :class="styles.track"><Slider.Indicator :class="styles.indicator" /></Slider.Track>
                <Slider.Thumb :class="styles.thumb" />
            </Slider.Control>
            <Slider.Value :class="styles.value" />
        </Slider.Root>
        <Slider.Root :default-value="[20, 80]" :min-steps-between-values="10" :format="DOLLARS" locale="en-US" :class="styles.root">
            <Slider.Label :class="styles.label">Price</Slider.Label>
            <Slider.Control :class="styles.control">
                <Slider.Track :class="styles.track"><Slider.Indicator :class="styles.indicator" /></Slider.Track>
                <Slider.Thumb aria-label="Minimum price" :class="styles.thumb" />
                <Slider.Thumb aria-label="Maximum price" :class="styles.thumb" />
            </Slider.Control>
            <Slider.Value :class="styles.value" />
        </Slider.Root>
    </div>
</template>
