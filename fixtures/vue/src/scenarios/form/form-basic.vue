<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { Form } from "../../kit/ui/form.ts";
import { validateWorkEmail } from "../field/validators.ts";

type Errors = Record<string, string | readonly string[]>;

/** The keys of the errors left, as the scenario prints them (spec/form.md). */
const keys = (errors: Errors) => Object.keys(errors).join(",") || "empty";

const errors = ref<Errors>({});
const form = ref<string>();
const cleared = ref<string>();
const onClearErrors = (next: Errors) => {
    errors.value = next;
    cleared.value = keys(next);
};
const onSubmit = (event: Event) => {
    event.preventDefault();
    const element = event.currentTarget as HTMLFormElement;
    const data = new FormData(element);
    form.value = formEntries(element);
    // the server answers a task later
    setTimeout(() => {
        errors.value =
            data.get("username") === "admin"
                ? { username: "This username is taken." }
                : {};
    });
};
</script>

<template>
    <Form aria-label="Sign up" validation-mode="onBlur" :errors="errors" @clear-errors="onClearErrors" @submit="onSubmit">
        <Field.Root name="email" :validate="validateWorkEmail">
            <Field.Label>Email</Field.Label>
            <Field.Control type="email" required />
            <Field.Error match="valueMissing">Enter your email.</Field.Error>
            <Field.Error match="customError" />
        </Field.Root>
        <Field.Root name="username">
            <Field.Label>Username</Field.Label>
            <Field.Control />
            <Field.Error />
        </Field.Root>
        <button type="submit">Submit</button>
    </Form>
    <Output :values="{ form, cleared }" />
</template>
