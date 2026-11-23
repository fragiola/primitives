<script setup lang="ts">
import type { PlainDate } from "@fragiola/primitives-vue/date-picker-input";
import { ref } from "vue";
import { isoDateTime } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { Calendar } from "../../kit/ui/calendar.ts";
import CalendarViews from "../../kit/ui/calendar-views.vue";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import { DatePickerInput } from "../../kit/ui/date-picker-input.ts";
import { Field } from "../../kit/ui/field.ts";
import TypedDate from "../../kit/ui/typed-date.vue";

// spec/month-calendar.md, `/calendar-view/typed`
const MIN: PlainDate = { year: 2025, month: 1, day: 1 };
const value = ref<string>();
const changes = ref(0);
const onValueChange = (next: Parameters<typeof isoDateTime>[0]) => {
    changes.value += 1;
    value.value = isoDateTime(next) ?? "none";
};
</script>

<template>
    <Field.Root>
        <Field.Label>Arrival</Field.Label>
        <DatePickerInput.Root locale="en-US" :min="MIN" @value-change="onValueChange">
            <TypedDate trigger="Choose date" />
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose date">
                        <Calendar.Root>
                            <CalendarViews />
                        </Calendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </DatePickerInput.Root>
    </Field.Root>
    <Output :values="{ value, changes }" />
</template>
