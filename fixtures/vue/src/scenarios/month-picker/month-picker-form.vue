<script setup lang="ts">
import {
    MonthPicker,
    type PlainYearMonth,
} from "@fragiola/primitives-vue/month-picker";
import {
    MonthRangePicker,
    type YearMonthRange,
} from "@fragiola/primitives-vue/month-range-picker";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import { isoMonth, isoPeriod } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import {
    MonthCalendar,
    MonthRangeCalendar,
} from "../../kit/ui/month-calendar.ts";
import PageView from "../../kit/ui/page-view.vue";

// spec/month-calendar.md, `/month-picker/form`
const MIN: PlainYearMonth = { year: 2026, month: 11 };
const expiry = ref<PlainYearMonth | null>(null);
const period = ref<YearMonthRange | null>(null);
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <MonthPicker.Root v-model:value="expiry" name="expiry" required :min="MIN" locale="en-US">
            <DatePicker.Trigger><TextRuns :runs="['Expiry: ', isoMonth(expiry) ?? 'none']" /></DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose month">
                        <MonthCalendar.Root>
                            <PageView prev="Previous year" next="Next year" />
                        </MonthCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </MonthPicker.Root>
        <MonthRangePicker.Root v-model:value="period" name="period" locale="en-US">
            <DatePicker.Trigger><TextRuns :runs="['Period: ', isoPeriod(period, isoMonth) ?? 'none']" /></DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose months">
                        <MonthRangeCalendar.Root>
                            <PageView prev="Previous year" next="Next year" />
                        </MonthRangeCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </MonthRangePicker.Root>
        <div class="flex gap-2">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
        </div>
    </form>
    <Output :values="{ form }" />
</template>
