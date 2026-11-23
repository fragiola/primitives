<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/password-input";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { PasswordInput } from "../../kit/ui/password-input.ts";

// A password in a native form (spec/password-input.md, `/password-input/basic`).
const value = ref<string>();
const visible = ref<boolean>();
const reason = ref<string>();
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
const onValue = (next: string, details: ChangeDetails) => {
    value.value = next;
    reason.value = details.reason;
};
const onVisible = (next: boolean, details: ChangeDetails) => {
    visible.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <label for="password" class="text-sm font-medium">Password</label>
        <PasswordInput.Root id="password" name="password" @value-change="onValue" @visible-change="onVisible">
            <PasswordInput.Input autocomplete="current-password" />
            <PasswordInput.VisibilityTrigger aria-label="Show password" />
        </PasswordInput.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ value, visible, reason, form }" />
</template>
