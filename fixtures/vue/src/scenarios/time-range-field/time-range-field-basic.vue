<script setup lang="ts">
import { isoTimeRange } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TimeRangeField } from "../../kit/ui/date-field.ts";
import { Field } from "../../kit/ui/field.ts";
import RangeEnds from "../../kit/ui/range-ends.vue";
import { useFieldOutput } from "../date-field/use-field-output.ts";

// spec/date-range-field.md, `/time-range-field/basic`
const output = useFieldOutput(isoTimeRange);
const { values } = output;
</script>

<template>
    <Field.Root>
        <Field.Label>Opening hours</Field.Label>
        <TimeRangeField.Root locale="en-US" @value-change="output.onValueChange">
            <RangeEnds start="Opens" end="Closes" />
        </TimeRangeField.Root>
    </Field.Root>
    <Output :values="values" />
</template>
