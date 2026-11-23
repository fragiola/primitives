<script setup lang="ts">
import { isoTime } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TimeField } from "../../kit/ui/date-field.ts";
import { Field } from "../../kit/ui/field.ts";
import { useFieldOutput } from "../date-field/use-field-output.ts";

// spec/date-field.md, `/time-field/basic`
defineProps<{ locale?: string }>();
const output = useFieldOutput(isoTime);
const { values } = output;
</script>

<template>
    <Field.Root>
        <Field.Label>Meeting time</Field.Label>
        <TimeField.Root :locale="locale" @value-change="output.onValueChange">
            <TimeField.Input />
        </TimeField.Root>
    </Field.Root>
    <Output :values="values" />
</template>
