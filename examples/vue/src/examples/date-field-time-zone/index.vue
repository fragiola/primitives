<script setup lang="ts">
import {
    formatTimeZoneName,
    timeZone,
    toIsoZoned,
    toTimeZone,
    toZoned,
    type ZonedDateTime,
} from "@fragiola/primitives/time-zone";
import {
    DateField,
    type DateFieldValue,
} from "@fragiola/primitives-vue/date-field";
import { Field } from "@fragiola/primitives-vue/field";
import { ref } from "vue";
import { styles } from "./styles.ts";

const newYork = timeZone("America/New_York");
/** The zones the meeting is shown in, besides the field's. */
const OTHERS = [
    { city: "London", zone: "Europe/London" },
    { city: "Kolkata", zone: "Asia/Kolkata" },
];
const pad = (value: number) => String(value).padStart(2, "0");
const DAY = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
});
/** `Tue, Nov 24, 14:00 GMT`: a zoned value's wall time, read in its own zone. */
const wallTime = (value: ZonedDateTime) =>
    `${DAY.format(Date.UTC(value.year, value.month - 1, value.day))}, ${pad(value.hour)}:${pad(value.minute)} ${formatTimeZoneName("en-US", value)}`;

const meeting = ref<ZonedDateTime | null>(
    toZoned(
        {
            year: 2026,
            month: 11,
            day: 24,
            hour: 9,
            minute: 0,
            second: 0,
            millisecond: 0,
        },
        newYork.id,
    ),
);
/** A field's value is a `ZonedDateTime` once it has a time zone. */
const setFromField = (value: DateFieldValue | null) => {
    meeting.value =
        value !== null && "offset" in value ? (value as ZonedDateTime) : null;
};

// A meeting typed in New York time: with `timeZone`, the field's value is a ZonedDateTime and its
// zone's name is a segment ("EST", then "EDT" once the clocks change). The other zones show the
// same instant, so a date after New York's spring change keeps 9:00 there while London and
// Kolkata move (spec/time-zones.md).
</script>

<template>
    <div :class="styles.example">
        <Field.Root :class="styles.field.root">
            <Field.Label :class="styles.field.label">Meeting (New York)</Field.Label>
            <DateField.Root :value="meeting" :time-zone="newYork" granularity="minute" locale="en-US" :class="styles.root" @update:value="setFromField">
                <DateField.Input v-slot="{ segment }" :class="styles.input">
                    <DateField.Segment :key="segment.index" :segment="segment" :class="styles.segment" />
                </DateField.Input>
            </DateField.Root>
        </Field.Root>
        <dl :class="styles.zones">
            <div v-for="{ city, zone } in OTHERS" :key="zone" :class="styles.row">
                <dt :class="styles.zone">{{ city }}</dt>
                <dd :class="styles.time">{{ meeting === null ? "–" : wallTime(toTimeZone(meeting, zone)) }}</dd>
            </div>
        </dl>
        <p role="status" :class="styles.status">{{ meeting === null ? "ISO: none" : `ISO: ${toIsoZoned(meeting)}` }}</p>
    </div>
</template>
