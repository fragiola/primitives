<script setup lang="ts">
import { Field, type FieldValidity } from "@fragiola/primitives-vue/field";
import { type PlainTime, TimeField } from "@fragiola/primitives-vue/time-field";
import { ref } from "vue";
import { styles } from "./styles.ts";

const time = (hour: number): PlainTime => ({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
});
const OPENS = time(9);
const CLOSES = time(17);
const outsideHours = (validity: FieldValidity) =>
    validity.rangeUnderflow || validity.rangeOverflow;

const value = ref<PlainTime | null>(null);
const saved = ref<string | null>(null);
const onSubmit = (event: Event) => {
    const data = new FormData(event.currentTarget as HTMLFormElement);
    saved.value = String(data.get("meeting"));
};

// A meeting time typed in parts: the hour, the minutes and AM or PM (typed by its first letter,
// or toggled with the arrows). Office hours bound it: a time outside them is invalid, and the
// field submits the ISO time itself (spec/date-field.md, TimeField).
</script>

<template>
    <form :class="styles.form" @submit.prevent="onSubmit">
        <Field.Root name="meeting" :class="styles.field.root">
            <Field.Label :class="styles.field.label">Meeting time</Field.Label>
            <TimeField.Root v-model:value="value" :min="OPENS" :max="CLOSES" required locale="en-US" :class="styles.root">
                <TimeField.Input v-slot="{ segment }" :class="styles.input">
                    <TimeField.Segment :key="segment.index" :segment="segment" :class="styles.segment" />
                </TimeField.Input>
            </TimeField.Root>
            <Field.Description :class="styles.field.description">Office hours: 9 AM to 5 PM.</Field.Description>
            <Field.Error :match="outsideHours" :class="styles.field.error">Choose a time within office hours.</Field.Error>
            <Field.Error match="valueMissing" :class="styles.field.error">Enter a time.</Field.Error>
        </Field.Root>
        <button type="submit" :class="styles.submit">Schedule</button>
        <p role="status" :class="styles.status">{{ saved === null ? "" : `Scheduled: ${saved}` }}</p>
    </form>
</template>
