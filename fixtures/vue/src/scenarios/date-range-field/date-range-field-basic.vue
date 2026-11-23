<script setup lang="ts">
import { isoRange } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { DateRangeField } from "../../kit/ui/date-field.ts";
import { Field } from "../../kit/ui/field.ts";
import RangeEnds from "../../kit/ui/range-ends.vue";
import { useFieldOutput } from "../date-field/use-field-output.ts";

// spec/date-range-field.md, `/date-range-field/basic`
const output = useFieldOutput(isoRange);
const { values } = output;
</script>

<template>
    <Field.Root>
        <Field.Label>Stay</Field.Label>
        <DateRangeField.Root locale="en-US" @value-change="output.onValueChange">
            <RangeEnds start="Start date" end="End date" />
        </DateRangeField.Root>
    </Field.Root>
    <Output :values="values" />
</template>
