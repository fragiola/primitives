<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { NumberField } from "../../kit/ui/number-field.ts";
import { useNumberOutput } from "./use-number-output.ts";

// spec/number-field.md, `/number-field/field`
const output = useNumberOutput();
const { values } = output;
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="guests">
            <Field.Label>Guests</Field.Label>
            <NumberField.Root
                required
                :min="1"
                :max="8"
                :clamp-on-blur="false"
                locale="en-US"
                @value-change="output.onValueChange"
            >
                <NumberField.Group>
                    <NumberField.Input />
                </NumberField.Group>
            </NumberField.Root>
            <Field.Description>Up to 8 guests.</Field.Description>
            <Field.Error>Enter between 1 and 8 guests.</Field.Error>
        </Field.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ ...values, form }" />
</template>
