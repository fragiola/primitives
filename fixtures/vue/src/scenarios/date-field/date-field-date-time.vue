<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import { isoDateTime } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { DateField } from "../../kit/ui/date-field.ts";
import { Field } from "../../kit/ui/field.ts";
import { useFieldOutput } from "./use-field-output.ts";

// spec/date-field.md, `/date-field/date-time`
defineProps<{ locale?: string }>();
const output = useFieldOutput(isoDateTime);
const { values } = output;
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="meeting">
            <Field.Label>Meeting</Field.Label>
            <DateField.Root :locale="locale" granularity="minute" @value-change="output.onValueChange">
                <DateField.Input />
            </DateField.Root>
        </Field.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ ...values, form }" />
</template>
