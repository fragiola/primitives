<script setup lang="ts">
import type { PlainDate } from "@fragiola/primitives-vue/calendar";
import { DatePicker as Picker } from "@fragiola/primitives-vue/date-picker";
import {
    type DateRange,
    DateRangePicker as RangePicker,
} from "@fragiola/primitives-vue/date-range-picker";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import { iso, isoRange } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { Calendar, RangeCalendar } from "../../kit/ui/calendar.ts";
import { Checkbox, CheckboxGroup } from "../../kit/ui/checkbox.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import { Field } from "../../kit/ui/field.ts";
import { Form } from "../../kit/ui/form.ts";
import MonthView from "../../kit/ui/month-view.vue";
import { validateToppings } from "./validators.ts";

const TOPPINGS = [
    { value: "cheese", label: "Cheese" },
    { value: "ham", label: "Ham" },
    { value: "pineapple", label: "Pineapple" },
];
const arrival = ref<PlainDate | null>(null);
const stay = ref<DateRange | null>(null);
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <Form @submit="onSubmit">
        <Field.Root name="toppings" :validate="validateToppings">
            <Field.Label>Toppings</Field.Label>
            <CheckboxGroup :default-value="[]">
                <label v-for="topping in TOPPINGS" :key="topping.value" class="flex items-center gap-2 text-sm"><Checkbox.Root :value="topping.value" />{{ topping.label }}</label>
            </CheckboxGroup>
            <Field.Description>Pick at least one.</Field.Description>
            <Field.Error />
        </Field.Root>
        <Field.Root name="arrival">
            <Field.Label>Arrival</Field.Label>
            <Picker.Root v-model:value="arrival" required locale="en-US">
                <DatePicker.Trigger>{{ iso(arrival) ?? "none" }}</DatePicker.Trigger>
                <DatePicker.Portal>
                    <DatePicker.Positioner :side-offset="4">
                        <DatePicker.Popup aria-label="Choose date">
                            <Calendar.Root>
                                <MonthView />
                            </Calendar.Root>
                        </DatePicker.Popup>
                    </DatePicker.Positioner>
                </DatePicker.Portal>
            </Picker.Root>
            <Field.Description>The day you arrive.</Field.Description>
            <Field.Error>Choose a date.</Field.Error>
        </Field.Root>
        <Field.Root name="stay">
            <Field.Label>Stay</Field.Label>
            <RangePicker.Root v-model:value="stay" required locale="en-US">
                <DatePicker.Trigger>{{ isoRange(stay) ?? "none" }}</DatePicker.Trigger>
                <DatePicker.Portal>
                    <DatePicker.Positioner :side-offset="4">
                        <DatePicker.Popup aria-label="Choose dates">
                            <RangeCalendar.Root>
                                <MonthView />
                            </RangeCalendar.Root>
                        </DatePicker.Popup>
                    </DatePicker.Positioner>
                </DatePicker.Portal>
            </RangePicker.Root>
            <Field.Description>From check-in to check-out.</Field.Description>
            <Field.Error>Choose your dates.</Field.Error>
        </Field.Root>
        <button type="submit">Submit</button>
    </Form>
    <Output :values="{ form }" />
</template>
