<script setup lang="ts">
import type { PlainDate } from "@fragiola/primitives-vue/date-field";
import { isoDateTime } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { DateField } from "../../kit/ui/date-field.ts";
import { useFieldOutput } from "./use-field-output.ts";

// spec/date-field.md, `/date-field/min-max`
const MIN = { year: 2026, month: 11, day: 10 };
const MAX = { year: 2026, month: 12, day: 5 };

/** Saturdays and Sundays. */
function isWeekend(date: PlainDate): boolean {
    const day = new Date(
        Date.UTC(date.year, date.month - 1, date.day),
    ).getUTCDay();
    return day === 0 || day === 6;
}

const output = useFieldOutput(isoDateTime);
const { values } = output;
</script>

<template>
    <DateField.Root locale="en-US" :min="MIN" :max="MAX" :is-date-unavailable="isWeekend" @value-change="output.onValueChange">
        <DateField.Input aria-label="Arrival" />
    </DateField.Root>
    <Output :values="{ value: values.value }" />
</template>
