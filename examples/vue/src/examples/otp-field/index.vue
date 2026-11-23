<script setup lang="ts">
import { Label } from "@fragiola/primitives-vue/label";
import { OTPField } from "@fragiola/primitives-vue/otp-field";
import { ref } from "vue";
import { styles } from "./styles.ts";

const SLOTS = [1, 2, 3, 4, 5, 6];
const code = ref<string | null>(null);

// A sign-in code: six slots, one digit each, named by their position. Typing moves forward,
// Backspace moves back, a paste fills every slot, and the browser's one-time-code autofill
// reaches the first one; the complete code is reported (spec/otp-field.md).
</script>

<template>
    <div :class="styles.stack">
        <Label id="sign-in-label" for="sign-in" :class="styles.label">Sign-in code</Label>
        <OTPField.Root
            id="sign-in"
            :length="6"
            aria-labelledby="sign-in-label"
            :class="styles.root"
            @value-change="code = null"
            @value-complete="(value: string) => (code = value)"
        >
            <OTPField.Input v-for="slot in SLOTS" :key="slot" :aria-label="`Digit ${slot} of 6`" :class="styles.input" />
        </OTPField.Root>
        <p :class="styles.status" aria-live="polite">
            {{ code === null ? "Enter the code we sent you." : `Code ${code} entered.` }}
        </p>
    </div>
</template>
