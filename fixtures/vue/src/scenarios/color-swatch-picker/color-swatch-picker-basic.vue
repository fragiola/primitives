<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import type { ChangeDetails } from "@fragiola/primitives-vue/color-swatch-picker";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.ts";
import Swatches from "./swatches.vue";

// spec/color-swatch-picker.md, `/color-swatch-picker/basic`; also `/rtl` (the page sets `dir`).
const value = ref<string>();
const reason = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValueChange = (next: Color | null, details: ChangeDetails) => {
    value.value = next === null ? undefined : formatColor(next, "hex");
    reason.value = details.reason;
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <h2 id="palette" class="text-sm font-semibold">Palette</h2>
        <ColorSwatchPicker.Root aria-labelledby="palette" name="color" @value-change="onValueChange">
            <Swatches />
        </ColorSwatchPicker.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ value, reason, form }" />
</template>
