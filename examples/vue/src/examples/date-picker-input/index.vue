<script setup lang="ts">
import { Calendar } from "@fragiola/primitives-vue/calendar";
import {
    type DateFieldValue,
    DatePicker,
    DatePickerInput,
    type PlainDate,
} from "@fragiola/primitives-vue/date-picker-input";
import { Field } from "@fragiola/primitives-vue/field";
import { ref } from "vue";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a row key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

const value = ref<DateFieldValue | null>(null);
const saved = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    saved.value = String(data.get("departure"));
};

// A date picker you can also type into: the segments take the departure date, the button beside
// them opens the calendar on it, and choosing a day fills the segments. A typed day before today is
// no value (the segments show it invalid) and leaves the field empty; the picker submits the day
// itself (spec/calendar.md, "Typed input").
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <Field.Root name="departure" :class="styles.field.root">
            <Field.Label :class="styles.field.label">Departure</Field.Label>
            <DatePickerInput.Root v-model:value="value" :min="today" required locale="en-US">
                <div :class="styles.typed.group">
                    <DatePickerInput.Segments v-slot="{ segment }" :class="styles.input">
                        <DatePickerInput.Segment :key="segment.index" :segment="segment" :class="styles.segment" />
                    </DatePickerInput.Segments>
                    <DatePicker.Trigger aria-label="Choose date" :class="styles.typed.trigger"><span aria-hidden="true">▾</span></DatePicker.Trigger>
                </div>
                <DatePicker.Portal>
                    <DatePicker.Positioner :side-offset="4" :class="styles.picker.positioner">
                        <DatePicker.Popup aria-label="Departure date" :class="styles.picker.popup">
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
            </DatePickerInput.Root>
            <Field.Error :class="styles.field.error">Enter a departure date from today on.</Field.Error>
        </Field.Root>
        <button type="submit" :class="styles.submit">Save</button>
        <p role="status" :class="styles.status">{{ saved === null ? "" : `Saved: ${saved}` }}</p>
    </form>
</template>
