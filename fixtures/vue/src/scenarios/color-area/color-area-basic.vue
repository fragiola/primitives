<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorArea } from "../../kit/ui/color-area.ts";

// spec/color-area.md, `/color-area/basic`; also `/color-area/rtl` (the page sets `dir`).
const value = ref<string>();
const committed = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: Color) => {
    value.value = formatColor(next, "hsb");
};
const onCommit = (next: Color) => {
    committed.value = formatColor(next, "hsb");
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <ColorArea.Root
            aria-label="Color"
            default-value="hsb(210, 50%, 50%)"
            x-channel="saturation"
            y-channel="brightness"
            locale="en-US"
            data-testid="area"
            @value-change="onValue"
            @value-commit="onCommit"
        >
            <ColorArea.Thumb>
                <ColorArea.Input axis="x" name="saturation" aria-label="Saturation" />
                <ColorArea.Input axis="y" name="brightness" aria-label="Brightness" />
            </ColorArea.Thumb>
        </ColorArea.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ value, committed, form }" />
</template>
