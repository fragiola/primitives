<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorField } from "../../kit/ui/color-field.ts";

// spec/color-field.md, `/color-field/channel`
const value = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: Color | null) => {
    value.value = next === null ? undefined : formatColor(next);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <ColorField.Root
            channel="hue"
            default-value="hsl(120, 50%, 50%)"
            locale="en-US"
            name="hue"
            @value-change="onValue"
        >
            <ColorField.Input aria-label="Hue" />
        </ColorField.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ value, form }" />
</template>
