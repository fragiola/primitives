<script setup lang="ts">
import {
    DateRangeField,
    type DateRangeFieldValue,
    type PlainDate,
} from "@fragiola/primitives-vue/date-range-field";
import { Field } from "@fragiola/primitives-vue/field";
import { ref } from "vue";
import { styles } from "./styles.ts";

const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

const value = ref<DateRangeFieldValue | null>(null);
const saved = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    saved.value = `${data.get("check-in")} → ${data.get("check-out")}`;
};

// A booking range typed in parts: the check-in date, then the check-out date, the typing moving on
// from one to the other. A day before today is invalid, and so is a check-out before the
// check-in; the field submits both ISO dates itself (spec/date-range-field.md).
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <Field.Root :class="styles.field.root">
            <Field.Label :class="styles.field.label">Stay</Field.Label>
            <DateRangeField.Root v-model:value="value" :min="today" required start-name="check-in" end-name="check-out" locale="en-US" :class="styles.root">
                <div :class="styles.ends">
                    <DateRangeField.Input v-slot="{ segment }" range="start" aria-label="Check-in" :class="styles.input">
                        <DateRangeField.Segment :key="segment.index" :segment="segment" :class="styles.segment" />
                    </DateRangeField.Input>
                    <span aria-hidden="true" :class="styles.separator">–</span>
                    <DateRangeField.Input v-slot="{ segment }" range="end" aria-label="Check-out" :class="styles.input">
                        <DateRangeField.Segment :key="segment.index" :segment="segment" :class="styles.segment" />
                    </DateRangeField.Input>
                </div>
            </DateRangeField.Root>
            <Field.Error match="valueMissing" :class="styles.field.error">Enter both dates.</Field.Error>
            <Field.Error match="rangeUnderflow" :class="styles.field.error">The stay cannot start in the past.</Field.Error>
            <Field.Error match="rangeOverflow" :class="styles.field.error">Check-out cannot be before check-in.</Field.Error>
        </Field.Root>
        <button type="submit" :class="styles.submit">Book</button>
        <p role="status" :class="styles.status">{{ saved === null ? "" : `Booked: ${saved}` }}</p>
    </form>
</template>
