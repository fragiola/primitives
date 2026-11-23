<script setup lang="ts">
import { isoDateTime } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { DateField } from "../../kit/ui/date-field.ts";
import { Field } from "../../kit/ui/field.ts";
import { useFieldOutput } from "./use-field-output.ts";

// spec/date-field.md, `/date-field/basic`
defineProps<{ locale?: string }>();
const output = useFieldOutput(isoDateTime);
const { values } = output;
</script>

<template>
    <Field.Root>
        <Field.Label>Birth date</Field.Label>
        <DateField.Root :locale="locale" @value-change="output.onValueChange">
            <DateField.Input v-slot="{ segment }">
                <DateField.Segment :key="segment.index" :segment="segment" />
            </DateField.Input>
        </DateField.Root>
    </Field.Root>
    <Output :values="values" />
</template>
