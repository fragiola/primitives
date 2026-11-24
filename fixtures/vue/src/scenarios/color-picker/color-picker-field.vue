<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorPicker } from "../../kit/ui/color-picker.ts";
import { ColorSlider } from "../../kit/ui/color-slider.ts";
import { ColorSwatch } from "../../kit/ui/color-swatch.ts";
import { Field } from "../../kit/ui/field.ts";

// spec/color-picker.md, `/color-picker/field`
const value = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValueChange = (next: Color) => {
    value.value = formatColor(next, "hex");
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="brand">
            <Field.Label>Brand color</Field.Label>
            <ColorPicker.Root default-value="#336699" @value-change="onValueChange">
                <ColorSlider.Root channel="hue" name="hue" locale="en-US">
                    <ColorSlider.Track>
                        <ColorSlider.Thumb aria-label="Hue" />
                    </ColorSlider.Track>
                </ColorSlider.Root>
                <ColorSwatch aria-label="Brand color preview" />
            </ColorPicker.Root>
            <Field.Description>Used for links.</Field.Description>
        </Field.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ value, form }" />
</template>
