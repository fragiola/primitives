import type { ChangeDetails } from "@fragiola/primitives-vue/otp-field";
import { computed, ref } from "vue";

/**
 * The last `value-change`, `value-complete` and `value-invalid` (spec/otp-field.md,
 * "Scenarios").
 */
export function useOtpOutput() {
    const last = ref<{ value: string; reason: string }>();
    const complete = ref<string>();
    const invalid = ref<string>();
    return {
        handlers: {
            onValueChange: (value: string, details: ChangeDetails) => {
                last.value = {
                    value: value === "" ? "empty" : value,
                    reason: details.reason,
                };
            },
            onValueComplete: (value: string) => {
                complete.value = value;
            },
            onValueInvalid: (text: string) => {
                invalid.value = text;
            },
        },
        values: computed(() => ({
            value: last.value?.value,
            reason: last.value?.reason,
            complete: complete.value,
            invalid: invalid.value,
        })),
    };
}
