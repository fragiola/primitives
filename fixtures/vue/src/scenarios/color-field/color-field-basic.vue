<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorField } from "../../kit/ui/color-field.ts";

// spec/color-field.md, `/color-field/basic`
const value = ref<string | null>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: Color | null) => {
    value.value = next === null ? null : formatColor(next, "hex");
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <label for="color">Color</label>
        <ColorField.Root id="color" default-value="#336699" name="color" @value-change="onValue">
            <ColorField.Input />
        </ColorField.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ value, form }" />
</template>
