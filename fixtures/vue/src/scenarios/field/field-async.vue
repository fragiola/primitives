<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { checkUsername } from "./validators.ts";

const resolved = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const validate = (value: unknown) =>
    checkUsername(value, (text) => {
        resolved.value = text;
    });
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root name="username" validation-mode="onChange" :validate="validate">
            <Field.Label>Username</Field.Label>
            <Field.Control />
            <Field.Error />
        </Field.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ resolved, form }" />
</template>
