<script setup lang="ts">
import { Field } from "@fragiola/primitives-vue/field";
import { MonthCalendar } from "@fragiola/primitives-vue/month-calendar";
import {
    MonthPicker,
    type PlainYearMonth,
} from "@fragiola/primitives-vue/month-picker";
import { ref } from "vue";
import { styles } from "./styles.ts";

/** `2026-11`: a row's key. */
const key = (month: { year: number; month?: number } | undefined) =>
    month ? `${month.year}-${month.month ?? 0}` : "";
/** `11/2026`: what the trigger shows, as a card prints it. */
const format = (month: PlainYearMonth) =>
    `${String(month.month).padStart(2, "0")}/${month.year}`;
const now = new Date();
const thisMonth: PlainYearMonth = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
};

const expiry = ref<PlainYearMonth | null>(null);
const saved = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    saved.value = `expiry=${String(data.get("expiry"))}`;
};

// A card's expiry: a required month picker in a field. The popup holds the months of a year (the
// past ones disabled), choosing one closes it and returns focus to the trigger, and the picker
// submits the month as ISO `2026-11`; saving with no month shows the error and focuses the trigger
// (spec/month-calendar.md, "Forms").
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <Field.Root name="expiry" :class="styles.field.root">
            <Field.Label :class="styles.field.label">Expiry date</Field.Label>
            <MonthPicker.Root v-model:value="expiry" :min="thisMonth" required locale="en-US">
                <MonthPicker.Trigger :class="styles.picker.trigger">{{ expiry ? format(expiry) : "Choose a month" }}</MonthPicker.Trigger>
                <MonthPicker.Portal>
                    <MonthPicker.Positioner :side-offset="4" :class="styles.picker.positioner">
                        <MonthPicker.Popup aria-label="Expiry month" :class="styles.picker.popup">
                            <MonthCalendar.Root :class="styles.calendar.root">
                                <div :class="styles.header">
                                    <MonthCalendar.PrevButton aria-label="Previous year" :class="styles.calendar.prevButton">‹</MonthCalendar.PrevButton>
                                    <MonthCalendar.Heading :class="styles.calendar.heading" />
                                    <MonthCalendar.NextButton aria-label="Next year" :class="styles.calendar.nextButton">›</MonthCalendar.NextButton>
                                </div>
                                <MonthCalendar.Grid :class="styles.calendar.grid">
                                    <MonthCalendar.GridBody v-slot="{ row }">
                                        <MonthCalendar.Row :key="key(row[0])" :row="row" v-slot="{ item }">
                                            <MonthCalendar.Cell :key="key(item)" :value="item" :class="styles.calendar.cell" />
                                        </MonthCalendar.Row>
                                    </MonthCalendar.GridBody>
                                </MonthCalendar.Grid>
                            </MonthCalendar.Root>
                        </MonthPicker.Popup>
                    </MonthPicker.Positioner>
                </MonthPicker.Portal>
            </MonthPicker.Root>
            <Field.Error :class="styles.field.error">Choose the card's expiry month.</Field.Error>
        </Field.Root>
        <button type="submit" :class="styles.submit">Save</button>
        <p role="status" :class="styles.status">{{ saved === null ? "" : `Saved: ${saved}` }}</p>
    </form>
</template>
