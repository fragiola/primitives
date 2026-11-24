<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorSwatchPicker } from "../../kit/ui/color-swatch-picker.ts";
import { Field } from "../../kit/ui/field.ts";
import Swatches from "./swatches.vue";

// spec/color-swatch-picker.md, `/color-swatch-picker/field`
const value = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValueChange = (next: Color | null) => {
    value.value = next === null ? undefined : formatColor(next, "hex");
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="accent">
            <Field.Label>Accent</Field.Label>
            <ColorSwatchPicker.Root default-value="#00ff00" @value-change="onValueChange">
                <Swatches />
            </ColorSwatchPicker.Root>
            <Field.Description>The links' color.</Field.Description>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, form }" />
</template>
