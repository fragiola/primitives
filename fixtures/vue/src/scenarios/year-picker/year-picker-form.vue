<script setup lang="ts">
import {
    type PlainYear,
    YearPicker,
} from "@fragiola/primitives-vue/year-picker";
import {
    type YearRange,
    YearRangePicker,
} from "@fragiola/primitives-vue/year-range-picker";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import { isoPeriod, isoYear } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import {
    YearCalendar,
    YearRangeCalendar,
} from "../../kit/ui/month-calendar.ts";
import PageView from "../../kit/ui/page-view.vue";

// spec/month-calendar.md, `/year-picker/form`
const year = ref<PlainYear | null>(null);
const years = ref<YearRange | null>(null);
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <YearPicker.Root v-model:value="year" name="year" locale="en-US">
            <DatePicker.Trigger><TextRuns :runs="['Year: ', isoYear(year) ?? 'none']" /></DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose year">
                        <YearCalendar.Root>
                            <PageView prev="Previous years" next="Next years" />
                        </YearCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </YearPicker.Root>
        <YearRangePicker.Root v-model:value="years" name="years" locale="en-US">
            <DatePicker.Trigger><TextRuns :runs="['Years: ', isoPeriod(years, isoYear) ?? 'none']" /></DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose years">
                        <YearRangeCalendar.Root>
                            <PageView prev="Previous years" next="Next years" />
                        </YearRangeCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </YearRangePicker.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ form }" />
</template>
