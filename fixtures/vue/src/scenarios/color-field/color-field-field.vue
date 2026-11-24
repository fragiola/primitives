<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { ColorField } from "../../kit/ui/color-field.ts";
import { Field } from "../../kit/ui/field.ts";

// spec/color-field.md, `/color-field/field`
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="brand">
            <Field.Label>Brand color</Field.Label>
            <ColorField.Root default-value="#ff0000">
                <ColorField.Input />
            </ColorField.Root>
            <Field.Description>A hex color.</Field.Description>
        </Field.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ form }" />
</template>
