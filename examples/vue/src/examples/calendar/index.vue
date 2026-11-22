<script setup lang="ts">
import {
    type DateRange,
    type PlainDate,
    RangeCalendar,
} from "@fragiola/primitives-vue/range-calendar";
import { ref } from "vue";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const local = (date: PlainDate) =>
    new Date(date.year, date.month - 1, date.day);
const DAY = 24 * 60 * 60 * 1000;
/** `Nov 24 – 28, 2026, 4 nights`: the chosen stay. */
function summary(range: DateRange | null): string {
    if (range === null) {
        return "Choose your check-in, then your check-out.";
    }
    const dates = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
    }).formatRange(local(range.start), local(range.end));
    const nights = Math.round(
        (local(range.end).getTime() - local(range.start).getTime()) / DAY,
    );
    return `${dates}, ${nights} ${nights === 1 ? "night" : "nights"}`;
}

const stay = ref<DateRange | null>(null);
const offsets = [0, 1];

// A stay: two months side by side; the first day chosen is the check-in, hovering previews the
// stay, the second day chosen is the check-out (swapped when it comes first), Escape cancels a
// started stay (spec/calendar.md).
</script>

<template>
    <RangeCalendar.Root v-model:value="stay" :visible-months="2" locale="en-US" :class="styles.root">
        <div :class="styles.months">
            <div v-for="offset in offsets" :key="offset" :class="styles.month">
                <div :class="styles.header">
                    <RangeCalendar.PrevButton v-if="offset === 0" aria-label="Previous months" :class="styles.prevButton">‹</RangeCalendar.PrevButton>
                    <span v-else :class="styles.spacer" />
                    <RangeCalendar.Heading :offset="offset" :class="styles.heading" />
                    <RangeCalendar.NextButton v-if="offset === 1" aria-label="Next months" :class="styles.nextButton">›</RangeCalendar.NextButton>
                    <span v-else :class="styles.spacer" />
                </div>
                <RangeCalendar.Grid :offset="offset" :class="styles.grid">
                    <RangeCalendar.GridHeader v-slot="{ weekday }">
                        <RangeCalendar.HeaderCell :key="weekday.index" :weekday="weekday" :class="styles.headerCell" />
                    </RangeCalendar.GridHeader>
                    <RangeCalendar.GridBody v-slot="{ week }">
                        <RangeCalendar.Row :key="week.map(iso).join()" :week="week" v-slot="{ date }">
                            <RangeCalendar.Cell :key="iso(date)" :date="date" :class="styles.cell" />
                        </RangeCalendar.Row>
                    </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
            </div>
        </div>
        <p role="status" :class="styles.status">{{ summary(stay) }}</p>
    </RangeCalendar.Root>
</template>
