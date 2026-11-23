<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/date-picker-input";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import { isoDateTime } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { Calendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import { DatePickerInput } from "../../kit/ui/date-picker-input.ts";
import { Field } from "../../kit/ui/field.ts";
import MonthView from "../../kit/ui/month-view.vue";
import TypedDate from "../../kit/ui/typed-date.vue";

// spec/calendar.md, `/date-picker-input/basic`
const last = ref<{ value: string; reason: string }>();
const changes = ref(0);
const form = ref<string>();
const onValueChange = (
    value: Parameters<typeof isoDateTime>[0],
    details: ChangeDetails,
) => {
    changes.value += 1;
    last.value = {
        value: isoDateTime(value) ?? "none",
        reason: details.reason,
    };
};
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-2" @submit="onSubmit">
        <Field.Root name="arrival">
            <Field.Label>Arrival</Field.Label>
            <DatePickerInput.Root locale="en-US" required :min="{ year: 2026, month: 11, day: 10 }" @value-change="onValueChange">
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
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ value: last?.value, reason: last?.reason, changes, form }" />
</template>
