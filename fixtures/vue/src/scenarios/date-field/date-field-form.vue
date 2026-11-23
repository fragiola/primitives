<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { DateField } from "../../kit/ui/date-field.ts";
import { Field } from "../../kit/ui/field.ts";

// spec/date-field.md, `/date-field/form`
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="birth">
            <Field.Label>Birth date</Field.Label>
            <DateField.Root locale="en-US" required>
                <DateField.Input />
            </DateField.Root>
        </Field.Root>
        <DateField.Root locale="en-US" name="start" read-only :default-value="{ year: 2026, month: 11, day: 20 }">
            <DateField.Input aria-label="Start" />
        </DateField.Root>
        <DateField.Root locale="en-US" name="end" disabled :default-value="{ year: 2026, month: 11, day: 27 }">
            <DateField.Input aria-label="End" />
        </DateField.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
