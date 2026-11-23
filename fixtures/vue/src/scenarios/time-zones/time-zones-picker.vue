<script setup lang="ts">
import {
    timeZone,
    toZoned,
    type ZonedDateTime,
} from "@fragiola/primitives/time-zone";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Calendar, RangeCalendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import {
    DatePickerInput,
    DateRangePickerInput,
} from "../../kit/ui/date-picker-input.ts";
import { Field } from "../../kit/ui/field.ts";
import MonthView from "../../kit/ui/month-view.vue";
import TypedDate from "../../kit/ui/typed-date.vue";
import TypedRange from "../../kit/ui/typed-range.vue";

// spec/time-zones.md, `/time-zones/picker`
const newYork = timeZone("America/New_York");
const meetingDefault = toZoned(
    {
        year: 2026,
        month: 3,
        day: 7,
        hour: 2,
        minute: 30,
        second: 0,
        millisecond: 0,
    },
    "America/New_York",
);
const meeting = ref<string>();
const trip = ref<string>();
const onMeeting = (value: unknown) => {
    meeting.value =
        value === null ? "none" : newYork.toIso(value as ZonedDateTime);
};
const onTrip = (value: { start: unknown; end: unknown } | null) => {
    trip.value =
        value === null
            ? "none"
            : `${newYork.toIso(value.start as ZonedDateTime)}/${newYork.toIso(value.end as ZonedDateTime)}`;
};
</script>

<template>
    <div class="flex flex-col items-start gap-3">
        <Field.Root name="meeting">
            <Field.Label>Meeting</Field.Label>
            <DatePickerInput.Root
                locale="en-US"
                granularity="minute"
                :time-zone="newYork"
                :default-value="meetingDefault"
                @value-change="onMeeting"
            >
                <TypedDate trigger="Choose date" />
                <DatePicker.Portal>
                    <DatePicker.Positioner :side-offset="4">
                        <DatePicker.Popup aria-label="Choose date">
                            <Calendar.Root>
                                <MonthView />
                            </Calendar.Root>
                        </DatePicker.Popup>
                    </DatePicker.Positioner>
                </DatePicker.Portal>
            </DatePickerInput.Root>
        </Field.Root>
        <Field.Root name="trip">
            <Field.Label>Trip</Field.Label>
            <DateRangePickerInput.Root locale="en-US" granularity="minute" :time-zone="newYork" @value-change="onTrip">
                <TypedRange start="Start" end="End" trigger="Choose dates" />
                <DatePicker.Portal>
                    <DatePicker.Positioner :side-offset="4">
                        <DatePicker.Popup aria-label="Choose dates">
                            <RangeCalendar.Root>
                                <MonthView />
                            </RangeCalendar.Root>
                        </DatePicker.Popup>
                    </DatePicker.Positioner>
                </DatePicker.Portal>
            </DateRangePickerInput.Root>
        </Field.Root>
    </div>
    <Output :values="{ meeting, trip }" />
</template>
