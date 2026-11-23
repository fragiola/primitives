<script setup lang="ts">
import { persian } from "@fragiola/primitives/calendar-systems";
import { Calendar, type PlainDate } from "@fragiola/primitives-vue/calendar";
import {
    DateField,
    type DateFieldValue,
} from "@fragiola/primitives-vue/date-field";
import { Field } from "@fragiola/primitives-vue/field";
import { ref } from "vue";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-20`: the ISO date, whatever calendar shows it. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

const date = ref<PlainDate | null>(today);
/** The date part of a field's value (a day granularity gives a date already). */
const setFromField = (value: DateFieldValue | null) => {
    date.value =
        value === null
            ? null
            : { year: value.year, month: value.month, day: value.day };
};

// A calendar and a date field in the Persian calendar, right to left: `calendar` makes the grid's
// months, its names and Page Up / Down the system's, and the field's segments its year, month and
// day, while both keep one ISO date (spec/calendar-systems.md).
</script>

<template>
    <div :class="styles.example">
        <div dir="rtl" :class="styles.panel">
            <Calendar.Root v-model:value="date" :calendar="persian" locale="fa-IR" :class="styles.calendar.root">
                <div :class="styles.header">
                    <Calendar.PrevButton aria-label="Previous month" :class="styles.calendar.prevButton">›</Calendar.PrevButton>
                    <Calendar.Heading :class="styles.calendar.heading" />
                    <Calendar.NextButton aria-label="Next month" :class="styles.calendar.nextButton">‹</Calendar.NextButton>
                </div>
                <Calendar.Grid :class="styles.calendar.grid">
                    <Calendar.GridHeader v-slot="{ weekday }">
                        <Calendar.HeaderCell :key="weekday.index" :weekday="weekday" :class="styles.calendar.headerCell" />
                    </Calendar.GridHeader>
                    <Calendar.GridBody v-slot="{ week }">
                        <Calendar.Row :key="iso(week[0] ?? today)" :week="week" v-slot="{ date: day }">
                            <Calendar.Cell :key="iso(day)" :date="day" :class="styles.calendar.cell" />
                        </Calendar.Row>
                    </Calendar.GridBody>
                </Calendar.Grid>
            </Calendar.Root>
            <Field.Root :class="styles.field.root">
                <Field.Label :class="styles.field.label">Date</Field.Label>
                <DateField.Root :value="date" :calendar="persian" locale="fa-IR" :class="styles.dateField.root" @update:value="setFromField">
                    <DateField.Input v-slot="{ segment }" :class="styles.dateField.input">
                        <DateField.Segment :key="segment.index" :segment="segment" :class="styles.dateField.segment" />
                    </DateField.Input>
                </DateField.Root>
            </Field.Root>
        </div>
        <p role="status" :class="styles.status">{{ date === null ? "ISO: none" : `ISO: ${iso(date)}` }}</p>
    </div>
</template>
