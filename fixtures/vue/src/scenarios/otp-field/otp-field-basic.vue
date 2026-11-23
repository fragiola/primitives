<script setup lang="ts">
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Label } from "../../kit/ui/label.ts";
import { OTPField } from "../../kit/ui/otp-field.ts";
import { useOtpOutput } from "./use-otp-output.ts";

// spec/otp-field.md, `/otp-field/basic` (and `?dir=rtl`)
const SIX = [1, 2, 3, 4, 5, 6];
const FOUR = [1, 2, 3, 4];
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
        <Label id="code-label" for="code">Verification code</Label>
        <OTPField.Root
            id="code"
            name="code"
            :length="6"
            aria-labelledby="code-label"
            @value-change="handlers.onValueChange"
            @value-complete="handlers.onValueComplete"
            @value-invalid="handlers.onValueInvalid"
        >
            <OTPField.Input v-for="slot in SIX" :key="slot" :aria-label="`Digit ${slot} of 6`" />
        </OTPField.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <div class="mt-4 flex flex-col items-start gap-2">
        <OTPField.Root aria-label="Backup code" :length="4" read-only default-value="2468">
            <OTPField.Input v-for="slot in FOUR" :key="slot" :aria-label="`Backup digit ${slot} of 4`" />
        </OTPField.Root>
        <OTPField.Root aria-label="Old code" :length="4" disabled>
            <OTPField.Input v-for="slot in FOUR" :key="slot" :aria-label="`Old digit ${slot} of 4`" />
        </OTPField.Root>
    </div>
    <Output :values="{ ...values, form }" />
</template>
