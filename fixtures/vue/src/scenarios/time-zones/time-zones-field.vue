<script setup lang="ts">
import {
    type TimeZone,
    timeZone,
    toZoned,
    type ZonedDateTime,
} from "@fragiola/primitives/time-zone";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import Output from "../../kit/output.vue";
import { DateField, DateRangeField } from "../../kit/ui/date-field.ts";
import { Field } from "../../kit/ui/field.ts";
import RangeEnds from "../../kit/ui/range-ends.vue";

// spec/time-zones.md, `/time-zones/field`
const newYork = timeZone("America/New_York");
const london = timeZone("Europe/London");
const departureDefault = toZoned(
    {
        year: 2026,
        month: 11,
        day: 1,
        hour: 1,
        minute: 30,
        second: 0,
        millisecond: 0,
    },
    "America/New_York",
    "earlier",
);
/** A zoned value's ISO text (`none` with none). */
const zonedIso = (zone: TimeZone, value: unknown): string =>
    value !== null && typeof value === "object" && "offset" in value
        ? zone.toIso(value as ZonedDateTime)
        : "none";
const departure = ref<string>();
const back = ref<string>();
const stay = ref<string>();
const form = ref<string>();
const onDeparture = (value: unknown) => {
    departure.value = zonedIso(newYork, value);
};
const onBack = (value: unknown) => {
    back.value = zonedIso(newYork, value);
};
const onStay = (value: { start: unknown; end: unknown } | null) => {
    stay.value =
        value === null
            ? "none"
            : `${zonedIso(newYork, value.start)}/${zonedIso(newYork, value.end)}`;
};
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-3" @submit="onSubmit">
        <Field.Root>
            <Field.Label>Departure</Field.Label>
            <DateField.Root
                locale="en-US"
                granularity="minute"
                name="departure"
                :time-zone="newYork"
                :default-value="departureDefault"
                @value-change="onDeparture"
            >
                <DateField.Input v-slot="{ segment }">
                    <DateField.Segment :key="segment.index" :segment="segment" />
                </DateField.Input>
            </DateField.Root>
        </Field.Root>
        <Field.Root>
            <Field.Label>Return</Field.Label>
            <DateField.Root
                locale="en-US"
                granularity="minute"
                name="return"
                :time-zone="newYork"
                disambiguation="later"
                @value-change="onBack"
            >
                <DateField.Input v-slot="{ segment }">
                    <DateField.Segment :key="segment.index" :segment="segment" />
                </DateField.Input>
            </DateField.Root>
        </Field.Root>
        <Field.Root>
            <Field.Label>Arrival</Field.Label>
            <DateField.Root locale="en-US" granularity="minute" name="arrival" :time-zone="london" hide-time-zone>
                <DateField.Input v-slot="{ segment }">
                    <DateField.Segment :key="segment.index" :segment="segment" />
                </DateField.Input>
            </DateField.Root>
        </Field.Root>
        <Field.Root>
            <Field.Label>Stay</Field.Label>
            <DateRangeField.Root
                locale="en-US"
                granularity="minute"
                :time-zone="newYork"
                start-name="from"
                end-name="to"
                @value-change="onStay"
            >
                <RangeEnds start="Start" end="End" />
            </DateRangeField.Root>
        </Field.Root>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ departure, return: back, stay, form }" />
</template>
