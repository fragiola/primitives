<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Field } from "../../kit/ui/field.ts";
import { OTPField } from "../../kit/ui/otp-field.ts";
import { useOtpOutput } from "./use-otp-output.ts";

// spec/otp-field.md, `/otp-field/field`
const SLOTS = [1, 2, 3, 4];
const output = useOtpOutput();
const { handlers, values } = output;
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="otp">
            <Field.Label>Sign-in code</Field.Label>
            <OTPField.Root
                :length="4"
                required
                validation-type="alphanumeric"
                mask
                @value-change="handlers.onValueChange"
                @value-complete="handlers.onValueComplete"
                @value-invalid="handlers.onValueInvalid"
            >
                <OTPField.Input v-for="slot in SLOTS" :key="slot" :aria-label="`Character ${slot} of 4`" />
            </OTPField.Root>
            <Field.Description>Check your email.</Field.Description>
            <Field.Error>Enter the 4-character code.</Field.Error>
        </Field.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ ...values, form }" />
</template>
