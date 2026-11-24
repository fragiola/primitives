<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorSlider } from "../../kit/ui/color-slider.ts";

// spec/color-slider.md, `/color-slider/basic`; also `/color-slider/rtl` (the page sets `dir`).
const value = ref<string>();
const committed = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: Color) => {
    value.value = formatColor(next);
};
const onCommit = (next: Color) => {
    committed.value = formatColor(next);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <ColorSlider.Root
            channel="hue"
            default-value="hsl(0, 100%, 50%)"
            name="color"
            locale="en-US"
            @value-change="onValue"
            @value-commit="onCommit"
        >
            <ColorSlider.Label>Hue</ColorSlider.Label>
            <ColorSlider.Track data-testid="track">
                <ColorSlider.Thumb />
            </ColorSlider.Track>
            <ColorSlider.Output />
        </ColorSlider.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ value, committed, form }" />
</template>
