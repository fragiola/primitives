<script setup lang="ts">
import type {
    ChangeDetails,
    DateRange,
    PlainDate,
} from "@fragiola/primitives-vue/calendar";
import { ref } from "vue";
import { iso, isoRange } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { Calendar, RangeCalendar } from "../../kit/ui/calendar.ts";
import { CalendarPreset, PresetList } from "../../kit/ui/calendar-preset.ts";
import MonthView from "../../kit/ui/month-view.vue";
import { lastSevenDays, todayPreset } from "./presets.ts";

// spec/calendar.md, `/calendar-preset/basic`
const MAX: PlainDate = { year: 2026, month: 12, day: 31 };
const CHRISTMAS: PlainDate = { year: 2026, month: 12, day: 25 };
const NEW_YEAR: PlainDate = { year: 2027, month: 1, day: 1 };
const NEXT_WEEK: DateRange = {
    start: { year: 2026, month: 11, day: 23 },
    end: { year: 2026, month: 11, day: 29 },
};
const date = ref<PlainDate | null>(null);
const reason = ref<string>();
const range = ref<DateRange | null>(null);
const onDateChange = (next: PlainDate | null, details: ChangeDetails) => {
    date.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <div class="flex flex-wrap gap-8">
        <section aria-label="Date">
            <Calendar.Root :value="date" :max="MAX" locale="en-US" @value-change="onDateChange">
                <MonthView />
                <PresetList>
                    <CalendarPreset :value="todayPreset">Today</CalendarPreset>
                    <CalendarPreset :value="CHRISTMAS">Christmas</CalendarPreset>
                    <CalendarPreset :value="NEW_YEAR">New Year</CalendarPreset>
                </PresetList>
            </Calendar.Root>
        </section>
        <section aria-label="Range">
            <RangeCalendar.Root v-model:value="range" locale="en-US">
                <MonthView />
                <PresetList>
                    <CalendarPreset :value="lastSevenDays">Last 7 days</CalendarPreset>
                    <CalendarPreset :value="NEXT_WEEK">Next week</CalendarPreset>
                </PresetList>
            </RangeCalendar.Root>
        </section>
    </div>
    <Output :values="{ date: iso(date), reason, range: isoRange(range) }" />
</template>
