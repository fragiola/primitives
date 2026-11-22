<script setup lang="ts">
import { Calendar } from "@fragiola/primitives-vue/calendar";
import {
    DatePicker,
    type PlainDate,
} from "@fragiola/primitives-vue/date-picker";
import { ref } from "vue";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: what the form submits. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
/** `Nov 24, 2026`: what the trigger shows. */
const format = (date: PlainDate) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(date.year, date.month - 1, date.day),
    );
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

const checkIn = ref<PlainDate | null>(null);
const booked = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    booked.value = String(data.get("check-in") || "no date");
};

// A booking form: the trigger opens a calendar on today, past days are disabled, choosing a day
// closes it and returns focus to the trigger, and a hidden input carries the day into the form
// (spec/calendar.md).
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <DatePicker.Root v-model:value="checkIn" :min="today" locale="en-US">
            <DatePicker.Trigger :class="styles.picker.trigger">Check-in: {{ checkIn ? format(checkIn) : "choose a date" }}</DatePicker.Trigger>
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4" :class="styles.picker.positioner">
                    <DatePicker.Popup aria-label="Check-in date" :class="styles.picker.popup">
                        <Calendar.Root :class="styles.calendar.root">
                            <div :class="styles.header">
                                <Calendar.PrevButton aria-label="Previous month" :class="styles.calendar.prevButton">‹</Calendar.PrevButton>
                                <Calendar.Heading :class="styles.calendar.heading" />
                                <Calendar.NextButton aria-label="Next month" :class="styles.calendar.nextButton">›</Calendar.NextButton>
                            </div>
                            <Calendar.Grid :class="styles.calendar.grid">
                                <Calendar.GridHeader v-slot="{ weekday }">
                                    <Calendar.HeaderCell :key="weekday.index" :weekday="weekday" :class="styles.calendar.headerCell" />
                                </Calendar.GridHeader>
                                <Calendar.GridBody v-slot="{ week }">
                                    <Calendar.Row :key="iso(week[0] ?? today)" :week="week" v-slot="{ date }">
                                        <Calendar.Cell :key="iso(date)" :date="date" :class="styles.calendar.cell" />
                                    </Calendar.Row>
                                </Calendar.GridBody>
                            </Calendar.Grid>
                        </Calendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </DatePicker.Root>
        <input type="hidden" name="check-in" :value="checkIn ? iso(checkIn) : ''" />
        <button type="submit" :class="styles.submit">Book</button>
        <p role="status" :class="styles.status">{{ booked === null ? "" : `Booked: ${booked}` }}</p>
    </form>
</template>
