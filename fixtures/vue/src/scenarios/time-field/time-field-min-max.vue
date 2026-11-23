<script setup lang="ts">
import type { PlainTime } from "@fragiola/primitives-vue/time-field";
import { isoTime } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TimeField } from "../../kit/ui/date-field.ts";
import { useFieldOutput } from "../date-field/use-field-output.ts";

// spec/date-field.md, `/time-field/min-max`
const time = (hour: number): PlainTime => ({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
});
const MIN = time(9);
const MAX = time(17);
const DEFAULT = time(9);
const output = useFieldOutput((value: PlainTime) => isoTime(value, true));
const { values } = output;
</script>

<template>
    <TimeField.Root locale="en-US" :hour-cycle="24" granularity="second" :min="MIN" :max="MAX" :default-value="DEFAULT" @value-change="output.onValueChange">
        <TimeField.Input aria-label="Opening" />
    </TimeField.Root>
    <Output :values="{ value: values.value }" />
</template>
