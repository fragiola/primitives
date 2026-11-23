<script setup lang="ts">
import {
    CalendarPreset,
    type DateRange,
    type PlainDate,
} from "@fragiola/primitives-vue/calendar-preset";
import { DateRangePicker } from "@fragiola/primitives-vue/date-range-picker";
import { RangeCalendar } from "@fragiola/primitives-vue/range-calendar";
import { ref } from "vue";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a row's key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
/** `Nov 14 – 20, 2026`: what the trigger shows. */
const format = (range: DateRange) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).formatRange(
        new Date(range.start.year, range.start.month - 1, range.start.day),
        new Date(range.end.year, range.end.month - 1, range.end.day),
    );
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};
/** `days` days before `date` (the month and year carry). */
const daysBefore = (date: PlainDate, days: number): PlainDate => {
    const local = new Date(date.year, date.month - 1, date.day - days);
    return {
        year: local.getFullYear(),
        month: local.getMonth() + 1,
        day: local.getDate(),
    };
};

// The presets: functions of today, read when they render and when they are pressed.
const lastWeek = (day: PlainDate): DateRange => ({
    start: daysBefore(day, 6),
    end: day,
});
const lastMonth = (day: PlainDate): DateRange => ({
    start: daysBefore(day, 29),
    end: day,
});
const thisMonth = (day: PlainDate): DateRange => ({
    start: { ...day, day: 1 },
    end: day,
});

const range = ref<DateRange | null>(lastWeek(today));

// A report's period: a date range picker whose calendar has presets. A preset sets the range in
// one press and closes the popup, as choosing the range's end does; the current one is marked
// (`data-selected`). Days after today are disabled (spec/calendar.md, "Presets").
</script>

<template>
    <div :class="styles.page">
        <DateRangePicker.Root v-model:value="range" :max="today" locale="en-US">
            <DateRangePicker.Trigger :class="styles.picker.trigger">{{ range ? format(range) : "Choose a period" }}</DateRangePicker.Trigger>
            <DateRangePicker.Portal>
                <DateRangePicker.Positioner :side-offset="4" :class="styles.picker.positioner">
                    <DateRangePicker.Popup aria-label="Report period" :class="styles.picker.popup">
                        <RangeCalendar.Root :class="styles.calendar.root">
                            <div :class="styles.preset.list">
                                <CalendarPreset :value="lastWeek" :class="styles.preset.preset">Last 7 days</CalendarPreset>
                                <CalendarPreset :value="lastMonth" :class="styles.preset.preset">Last 30 days</CalendarPreset>
                                <CalendarPreset :value="thisMonth" :class="styles.preset.preset">This month</CalendarPreset>
                            </div>
                            <div :class="styles.header">
                                <RangeCalendar.PrevButton aria-label="Previous month" :class="styles.calendar.prevButton">‹</RangeCalendar.PrevButton>
                                <RangeCalendar.Heading :class="styles.calendar.heading" />
                                <RangeCalendar.NextButton aria-label="Next month" :class="styles.calendar.nextButton">›</RangeCalendar.NextButton>
                            </div>
                            <RangeCalendar.Grid :class="styles.calendar.grid">
                                <RangeCalendar.GridHeader v-slot="{ weekday }">
                                    <RangeCalendar.HeaderCell :key="weekday.index" :weekday="weekday" :class="styles.calendar.headerCell" />
                                </RangeCalendar.GridHeader>
                                <RangeCalendar.GridBody v-slot="{ week }">
                                    <RangeCalendar.Row :key="iso(week[0] ?? today)" :week="week" v-slot="{ date }">
                                        <RangeCalendar.Cell :key="iso(date)" :date="date" :class="styles.calendar.cell" />
                                    </RangeCalendar.Row>
                                </RangeCalendar.GridBody>
                            </RangeCalendar.Grid>
                        </RangeCalendar.Root>
                    </DateRangePicker.Popup>
                </DateRangePicker.Positioner>
            </DateRangePicker.Portal>
        </DateRangePicker.Root>
    </div>
</template>
