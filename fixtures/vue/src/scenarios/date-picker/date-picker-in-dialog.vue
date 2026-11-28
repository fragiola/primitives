<script setup lang="ts">
import {
    type PlainDate,
    DatePicker as Primitive,
} from "@fragiola/primitives-vue/date-picker";
import { DateRangePicker } from "@fragiola/primitives-vue/date-range-picker";
import { MonthPicker } from "@fragiola/primitives-vue/month-picker";
import { MonthRangePicker } from "@fragiola/primitives-vue/month-range-picker";
import { YearPicker } from "@fragiola/primitives-vue/year-picker";
import { YearRangePicker } from "@fragiola/primitives-vue/year-range-picker";
import { ref } from "vue";
import { iso } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { Calendar, RangeCalendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import {
    DatePickerInput,
    DateRangePickerInput,
} from "../../kit/ui/date-picker-input.ts";
import { Dialog } from "../../kit/ui/dialog.ts";
import { Field } from "../../kit/ui/field.ts";
import {
    MonthCalendar,
    MonthRangeCalendar,
    YearCalendar,
    YearRangeCalendar,
} from "../../kit/ui/month-calendar.ts";
import MonthView from "../../kit/ui/month-view.vue";
import PageView from "../../kit/ui/page-view.vue";
import TypedDate from "../../kit/ui/typed-date.vue";
import TypedRange from "../../kit/ui/typed-range.vue";

// spec/calendar.md, `/date-picker/in-dialog`: every picker kind inside a modal Dialog
const value = ref<PlainDate | null>(null);
</script>

<template>
    <Dialog.Root>
        <Dialog.Trigger>Plan the trip</Dialog.Trigger>
        <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Popup>
                <Dialog.Title>Plan the trip</Dialog.Title>
                <div class="flex flex-col items-start gap-2">
                    <Primitive.Root v-model:value="value" locale="en-US">
                        <DatePicker.Trigger>Date</DatePicker.Trigger>
                        <DatePicker.Portal>
                            <DatePicker.Positioner :side-offset="4">
                                <DatePicker.Popup aria-label="Choose date">
                                    <Calendar.Root>
                                        <MonthView />
                                    </Calendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </Primitive.Root>
                    <DateRangePicker.Root locale="en-US">
                        <DatePicker.Trigger>Dates</DatePicker.Trigger>
                        <DatePicker.Portal>
                            <DatePicker.Positioner :side-offset="4">
                                <DatePicker.Popup aria-label="Choose dates">
                                    <RangeCalendar.Root>
                                        <MonthView />
                                    </RangeCalendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </DateRangePicker.Root>
                    <Field.Root>
                        <Field.Label>Arrival</Field.Label>
                        <DatePickerInput.Root locale="en-US">
                            <TypedDate trigger="Choose arrival" />
                            <DatePicker.Portal>
                                <DatePicker.Positioner :side-offset="4">
                                    <DatePicker.Popup aria-label="Arrival date">
                                        <Calendar.Root>
                                            <MonthView />
                                        </Calendar.Root>
                                    </DatePicker.Popup>
                                </DatePicker.Positioner>
                            </DatePicker.Portal>
                        </DatePickerInput.Root>
                    </Field.Root>
                    <Field.Root>
                        <Field.Label>Stay</Field.Label>
                        <DateRangePickerInput.Root locale="en-US">
                            <TypedRange start="Check-in" end="Check-out" trigger="Choose stay" />
                            <DatePicker.Portal>
                                <DatePicker.Positioner :side-offset="4">
                                    <DatePicker.Popup aria-label="Stay dates">
                                        <RangeCalendar.Root>
                                            <MonthView />
                                        </RangeCalendar.Root>
                                    </DatePicker.Popup>
                                </DatePicker.Positioner>
                            </DatePicker.Portal>
                        </DateRangePickerInput.Root>
                    </Field.Root>
                    <MonthPicker.Root locale="en-US">
                        <DatePicker.Trigger>Month</DatePicker.Trigger>
                        <DatePicker.Portal>
                            <DatePicker.Positioner :side-offset="4">
                                <DatePicker.Popup aria-label="Choose month">
                                    <MonthCalendar.Root>
                                        <PageView prev="Previous year" next="Next year" />
                                    </MonthCalendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </MonthPicker.Root>
                    <MonthRangePicker.Root locale="en-US">
                        <DatePicker.Trigger>Months</DatePicker.Trigger>
                        <DatePicker.Portal>
                            <DatePicker.Positioner :side-offset="4">
                                <DatePicker.Popup aria-label="Choose months">
                                    <MonthRangeCalendar.Root>
                                        <PageView prev="Previous year" next="Next year" />
                                    </MonthRangeCalendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </MonthRangePicker.Root>
                    <YearPicker.Root locale="en-US">
                        <DatePicker.Trigger>Year</DatePicker.Trigger>
                        <DatePicker.Portal>
                            <DatePicker.Positioner :side-offset="4">
                                <DatePicker.Popup aria-label="Choose year">
                                    <YearCalendar.Root>
                                        <PageView prev="Previous years" next="Next years" />
                                    </YearCalendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </YearPicker.Root>
                    <YearRangePicker.Root locale="en-US">
                        <DatePicker.Trigger>Years</DatePicker.Trigger>
                        <DatePicker.Portal>
                            <DatePicker.Positioner :side-offset="4">
                                <DatePicker.Popup aria-label="Choose years">
                                    <YearRangeCalendar.Root>
                                        <PageView prev="Previous years" next="Next years" />
                                    </YearRangeCalendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </YearRangePicker.Root>
                </div>
                <Dialog.Close>Close</Dialog.Close>
            </Dialog.Popup>
        </Dialog.Portal>
    </Dialog.Root>
    <Output :values="{ value: iso(value) }" />
</template>
