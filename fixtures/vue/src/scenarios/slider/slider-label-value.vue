<script setup lang="ts">
import { Slider } from "../../kit/ui/slider.ts";

const PERCENT = { style: "percent" } as const;
const EUROS = {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
} as const;
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <Slider.Root :min="0" :max="1" :step="0.01" :default-value="0.5" :format="PERCENT" locale="en-US">
            <Slider.Label>Volume</Slider.Label>
            <Slider.Control>
                <Slider.Track>
                    <Slider.Indicator />
                    <Slider.Thumb />
                </Slider.Track>
            </Slider.Control>
            <Slider.Value />
        </Slider.Root>
        <Slider.Root :default-value="[20, 80]" :format="EUROS" locale="de-DE">
            <Slider.Label>Price</Slider.Label>
            <Slider.Control>
                <Slider.Track>
                    <Slider.Indicator />
                    <Slider.Thumb aria-label="Minimum price" />
                    <Slider.Thumb aria-label="Maximum price" />
                </Slider.Track>
            </Slider.Control>
            <Slider.Value />
        </Slider.Root>
    </div>
</template>
