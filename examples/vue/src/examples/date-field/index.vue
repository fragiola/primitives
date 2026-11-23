<script setup lang="ts">
import {
    DateField,
    type DateFieldValue,
    type PlainDate,
} from "@fragiola/primitives-vue/date-field";
import { Field } from "@fragiola/primitives-vue/field";
import { ref } from "vue";
import { styles } from "./styles.ts";

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
    saved.value = String(data.get("birth-date"));
};

// A birth date typed in parts: month, day and year, each a spinbutton the keys step and digits
// fill (moving on by themselves). A date after today is invalid, and saving with none shows the
// error; the field submits the ISO date itself (spec/date-field.md).
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <Field.Root name="birth-date" :class="styles.field.root">
            <Field.Label :class="styles.field.label">Birth date</Field.Label>
            <DateField.Root v-model:value="value" :max="today" required locale="en-US" :class="styles.root">
                <DateField.Input v-slot="{ segment }" :class="styles.input">
                    <DateField.Segment :key="segment.index" :segment="segment" :class="styles.segment" />
                </DateField.Input>
            </DateField.Root>
            <Field.Error match="valueMissing" :class="styles.field.error">Enter your birth date.</Field.Error>
            <Field.Error match="rangeOverflow" :class="styles.field.error">The date cannot be in the future.</Field.Error>
        </Field.Root>
        <button type="submit" :class="styles.submit">Save</button>
        <p role="status" :class="styles.status">{{ saved === null ? "" : `Saved: ${saved}` }}</p>
    </form>
</template>
