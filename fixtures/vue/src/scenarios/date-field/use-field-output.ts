import type { ChangeDetails } from "@fragiola/primitives-vue/date-field";
import { computed, ref } from "vue";

/** The last `value-change` of a date or time field (spec/date-field.md, "Scenarios"). */
export function useFieldOutput<Value>(
    print: (value: Value) => string | undefined,
) {
    const last = ref<{ value: string; reason: string }>();
    return {
        onValueChange: (value: Value | null, details: ChangeDetails) => {
            last.value = {
                value: value === null ? "none" : (print(value) ?? "none"),
                reason: details.reason,
            };
        },
        values: computed(() => ({
            value: last.value?.value,
            reason: last.value?.reason,
        })),
    };
}
