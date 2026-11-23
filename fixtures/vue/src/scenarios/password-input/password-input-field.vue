<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { PasswordInput } from "../../kit/ui/password-input.ts";

// A required new password in a Field (spec/password-input.md, `/password-input/field`).
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Field.Root>
            <Field.Label>New password</Field.Label>
            <PasswordInput.Root required name="new-password">
                <PasswordInput.Input autocomplete="new-password" :minlength="8" />
                <PasswordInput.VisibilityTrigger aria-label="Show password" />
            </PasswordInput.Root>
            <Field.Description>At least 8 characters.</Field.Description>
            <Field.Error>Enter a password of 8 characters or more.</Field.Error>
        </Field.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
