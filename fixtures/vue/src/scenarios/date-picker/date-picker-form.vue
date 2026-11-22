<script setup lang="ts">
import {
    DatePicker as Picker,
    type PlainDate,
} from "@fragiola/primitives-vue/date-picker";
import {
    type DateRange,
    DateRangePicker as RangePicker,
} from "@fragiola/primitives-vue/date-range-picker";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import { iso, isoRange } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { Calendar, RangeCalendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import MonthView from "../../kit/ui/month-view.vue";

const NOV_30: PlainDate = { year: 2026, month: 11, day: 30 };

const arrival = ref<PlainDate | null>(null);
const stay = ref<DateRange | null>(null);
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Picker.Root v-model:value="arrival" name="arrival" required locale="en-US">
            <DatePicker.Trigger><TextRuns :runs="['Arrival: ', iso(arrival) ?? 'none']" /></DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose date">
                        <Calendar.Root>
                            <MonthView />
                        </Calendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </Picker.Root>
        <RangePicker.Root v-model:value="stay" name="stay" required locale="en-US">
            <DatePicker.Trigger><TextRuns :runs="['Stay: ', isoRange(stay) ?? 'none']" /></DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose dates">
                        <RangeCalendar.Root>
                            <MonthView />
                        </RangeCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </RangePicker.Root>
        <Picker.Root name="departure" read-only :value="NOV_30" locale="en-US">
            <DatePicker.Trigger><TextRuns :runs="['Departure: ', iso(NOV_30) ?? '']" /></DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Departure date">
                        <Calendar.Root>
                            <MonthView />
                        </Calendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </Picker.Root>
        <Picker.Root name="return" disabled locale="en-US">
            <DatePicker.Trigger>Return: none</DatePicker.Trigger>
        </Picker.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
