<script setup lang="ts">
import { DateRangePicker } from "@fragiola/primitives-vue/date-range-picker";
import { MonthPicker } from "@fragiola/primitives-vue/month-picker";
import { YearPicker } from "@fragiola/primitives-vue/year-picker";
import { computed, ref } from "vue";
import { systemOf } from "../../kit/calendar-system.ts";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { Calendar, RangeCalendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import { DatePickerInput } from "../../kit/ui/date-picker-input.ts";
import { Field } from "../../kit/ui/field.ts";
import { MonthCalendar, YearCalendar } from "../../kit/ui/month-calendar.ts";
import MonthView from "../../kit/ui/month-view.vue";
import PageView from "../../kit/ui/page-view.vue";
import TypedDate from "../../kit/ui/typed-date.vue";

// spec/calendar-systems.md, `/calendar-systems/pickers`
const props = defineProps<{ locale?: string }>();
const calendar = computed(() => systemOf(props.locale));
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-3" @submit="onSubmit">
        <Field.Root name="date">
            <Field.Label>Date</Field.Label>
            <DatePickerInput.Root :calendar="calendar" :locale="locale" :default-value="{ year: 2026, month: 11, day: 20 }">
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
        <DateRangePicker.Root :calendar="calendar" :locale="locale" name="stay">
            <DatePicker.Trigger>Stay</DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Stay">
                        <RangeCalendar.Root>
                            <MonthView />
                        </RangeCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </DateRangePicker.Root>
        <MonthPicker.Root :calendar="calendar" :locale="locale" name="month">
            <DatePicker.Trigger>Month</DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Month">
                        <MonthCalendar.Root>
                            <PageView prev="Previous year" next="Next year" />
                        </MonthCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </MonthPicker.Root>
        <YearPicker.Root :calendar="calendar" :locale="locale" name="year">
            <DatePicker.Trigger>Year</DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Year">
                        <YearCalendar.Root>
                            <PageView prev="Previous years" next="Next years" />
                        </YearCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </YearPicker.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ form }" />
</template>
