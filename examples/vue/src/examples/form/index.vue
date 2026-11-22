<script setup lang="ts">
import { Field } from "@fragiola/primitives-vue/field";
import { Form, type FormErrors } from "@fragiola/primitives-vue/form";
import { ref } from "vue";
import { styles } from "./styles.ts";

const errors = ref<FormErrors>({});
const status = ref("");
const chooseUsername = (value: unknown) =>
    value === "" ? "Choose a username." : null;
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const username = String(data.get("username"));
    status.value = "";
    // the server answers a moment later: `admin` is taken
    setTimeout(() => {
        if (username === "admin") {
            errors.value = { username: "This username is taken." };
        } else {
            status.value = `Account created for ${username}.`;
        }
    });
};

// Create an account: the Form validates every field on submit and focuses the first invalid
// one; the server's answer shows on the field it names, and typing in that field clears it
// (spec/form.md).
</script>

<template>
    <Form aria-label="Create account" :errors="errors" :class="styles.form" @clear-errors="(next: FormErrors) => (errors = next)" @submit.prevent="onSubmit">
        <Field.Root name="email" :class="styles.field.root">
            <Field.Label :class="styles.field.label">Email</Field.Label>
            <Field.Control type="email" required :class="styles.field.control" />
            <Field.Error match="valueMissing" :class="styles.field.error">Enter your email.</Field.Error>
            <Field.Error match="typeMismatch" :class="styles.field.error">Enter a valid email.</Field.Error>
        </Field.Root>
        <Field.Root name="username" :validate="chooseUsername" :class="styles.field.root">
            <Field.Label :class="styles.field.label">Username</Field.Label>
            <Field.Control required :class="styles.field.control" />
            <Field.Error :class="styles.field.error" />
        </Field.Root>
        <button type="submit" :class="styles.submit">Create account</button>
        <p role="status" :class="styles.status">{{ status }}</p>
    </Form>
</template>
