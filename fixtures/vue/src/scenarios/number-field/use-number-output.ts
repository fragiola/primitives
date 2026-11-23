import type { ChangeDetails } from "@fragiola/primitives-vue/number-field";
import { computed, ref } from "vue";

/** The last `value-change` (spec/number-field.md, "Scenarios"): its value and its reason. */
export function useNumberOutput() {
    const last = ref<{ value: string; reason: string }>();
    return {
        onValueChange: (value: number | null, details: ChangeDetails) => {
            last.value = {
                value: value === null ? "null" : String(value),
                reason: details.reason,
            };
        },
        values: computed(() => ({
            value: last.value?.value,
            reason: last.value?.reason,
        })),
    };
}
