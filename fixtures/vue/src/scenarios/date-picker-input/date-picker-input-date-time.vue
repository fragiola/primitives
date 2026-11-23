<script setup lang="ts">
import { isoDateTime } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { Calendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import { DatePickerInput } from "../../kit/ui/date-picker-input.ts";
import { Field } from "../../kit/ui/field.ts";
import MonthView from "../../kit/ui/month-view.vue";
import TypedDate from "../../kit/ui/typed-date.vue";
import { useFieldOutput } from "../date-field/use-field-output.ts";

// spec/calendar.md, `/date-picker-input/date-time`
const output = useFieldOutput(isoDateTime);
const { values } = output;
</script>

<template>
    <Field.Root>
        <Field.Label>Meeting</Field.Label>
        <DatePickerInput.Root locale="en-US" granularity="minute" @value-change="output.onValueChange">
            <TypedDate trigger="Choose date" />
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose date">
                        <Calendar.Root>
                            <MonthView />
                        </Calendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </DatePickerInput.Root>
    </Field.Root>
    <Output :values="values" />
</template>
