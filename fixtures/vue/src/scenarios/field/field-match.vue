<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { outOfRange } from "./validators.ts";

const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root name="age">
            <Field.Label>Age</Field.Label>
            <Field.Control type="number" required min="18" max="120" />
            <Field.Error match="valueMissing">Enter your age.</Field.Error>
            <Field.Error :match="outOfRange">Enter an age from 18 to 120.</Field.Error>
        </Field.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ form }" />
</template>
