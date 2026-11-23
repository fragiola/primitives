<script setup lang="ts">
import {
    MultipleCalendar,
    type PlainDate,
} from "@fragiola/primitives-vue/multiple-calendar";
import { ref } from "vue";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a row's key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

const saved = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const days = new FormData(event.currentTarget as HTMLFormElement).getAll(
        "days",
    );
    saved.value = days.length === 0 ? "no day" : days.join(", ");
};

// Several dates in one calendar: press the days you are available (from today on, five at most);
// a chosen day pressed again is removed. The calendar renders one hidden input per day, so the
// form submits `days` once per date (spec/calendar.md, "Multiple dates").
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <p id="availability-hint" :class="styles.hint">Choose up to five days you are available.</p>
        <MultipleCalendar.Root name="days" :max-selected="5" :min="today" locale="en-US" :class="styles.calendar.root">
            <div :class="styles.header">
                <MultipleCalendar.PrevButton aria-label="Previous month" :class="styles.calendar.prevButton">‹</MultipleCalendar.PrevButton>
                <MultipleCalendar.Heading :class="styles.calendar.heading" />
                <MultipleCalendar.NextButton aria-label="Next month" :class="styles.calendar.nextButton">›</MultipleCalendar.NextButton>
            </div>
            <MultipleCalendar.Grid aria-describedby="availability-hint" :class="styles.calendar.grid">
                <MultipleCalendar.GridHeader v-slot="{ weekday }">
                    <MultipleCalendar.HeaderCell :key="weekday.index" :weekday="weekday" :class="styles.calendar.headerCell" />
                </MultipleCalendar.GridHeader>
                <MultipleCalendar.GridBody v-slot="{ week }">
                    <MultipleCalendar.Row :key="iso(week[0] ?? today)" :week="week" v-slot="{ date }">
                        <MultipleCalendar.Cell :key="iso(date)" :date="date" :class="styles.calendar.cell" />
                    </MultipleCalendar.Row>
                </MultipleCalendar.GridBody>
            </MultipleCalendar.Grid>
        </MultipleCalendar.Root>
        <button type="submit" :class="styles.submit">Save</button>
        <p role="status" :class="styles.status">{{ saved === null ? "" : `Saved: ${saved}` }}</p>
    </form>
</template>
