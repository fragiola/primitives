<script setup lang="ts">
import { Field } from "@fragiola/primitives-vue/field";
import { styles } from "./styles.ts";

// A sign-up email: the label names the input, the description describes it, and "Sign up" with
// an empty or malformed address shows the matching error and focuses the input (spec/field.md).
</script>

<template>
    <form :class="styles.form" @submit.prevent>
        <Field.Root name="email" :class="styles.root">
            <Field.Label :class="styles.label">Email</Field.Label>
            <Field.Control type="email" required :class="styles.control" />
            <Field.Description :class="styles.description">We never share it.</Field.Description>
            <Field.Error match="valueMissing" :class="styles.error">Enter your email.</Field.Error>
            <Field.Error match="typeMismatch" :class="styles.error">Enter a valid email.</Field.Error>
        </Field.Root>
        <button type="submit" :class="styles.submit">Sign up</button>
    </form>
</template>
