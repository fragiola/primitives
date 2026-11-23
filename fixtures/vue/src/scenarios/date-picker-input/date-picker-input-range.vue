<script setup lang="ts">
import { isoRange } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { RangeCalendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import { DateRangePickerInput } from "../../kit/ui/date-picker-input.ts";
import { Field } from "../../kit/ui/field.ts";
import MonthView from "../../kit/ui/month-view.vue";
import TypedRange from "../../kit/ui/typed-range.vue";
import { useFieldOutput } from "../date-field/use-field-output.ts";

// spec/calendar.md, `/date-picker-input/range`
const output = useFieldOutput(isoRange);
const { values } = output;
</script>

<template>
    <Field.Root>
        <Field.Label>Stay</Field.Label>
        <DateRangePickerInput.Root locale="en-US" @value-change="output.onValueChange">
            <TypedRange start="Check-in" end="Check-out" trigger="Choose dates" />
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose dates">
                        <RangeCalendar.Root>
                            <MonthView />
                        </RangeCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </DateRangePickerInput.Root>
    </Field.Root>
    <Output :values="values" />
</template>
