<script setup lang="ts">
import { ref } from "vue";
import { Slider } from "../../kit/ui/slider.ts";

// spec/slider.md, `/slider/thumb-name`: a bound Thumb name wins over the Label.
const name = ref("Master volume");
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <Slider.Root :default-value="50">
            <Slider.Label>Volume</Slider.Label>
            <Slider.Control>
                <Slider.Track>
                    <Slider.Indicator />
                    <Slider.Thumb :aria-label="name" />
                </Slider.Track>
            </Slider.Control>
        </Slider.Root>
        <button type="button" @click="name = 'Main volume'">Rename</button>
    </div>
</template>
