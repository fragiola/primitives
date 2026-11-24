<script setup lang="ts">
import { type Color, formatColor } from "@fragiola/primitives/color";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorWheel } from "../../kit/ui/color-wheel.ts";

// spec/color-wheel.md, `/color-wheel/basic`
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
        <ColorWheel.Root
            default-value="hsl(90, 100%, 50%)"
            name="color"
            locale="en-US"
            :outer-radius="100"
            :inner-radius="76"
            data-testid="wheel"
            @value-change="onValue"
            @value-commit="onCommit"
        >
            <ColorWheel.Track />
            <ColorWheel.Thumb aria-label="Hue" />
        </ColorWheel.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ value, committed, form }" />
</template>
