<script setup lang="ts">
import {
    DatePicker as Picker,
    type PlainDate,
} from "@fragiola/primitives-vue/date-picker";
import { ref } from "vue";
import { formEntries } from "../../kit/form-entries.ts";
import { iso } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { Calendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import MonthView from "../../kit/ui/month-view.vue";

// spec/calendar.md, `/date-picker/mixed-form`: a picker before a native required input.
const arrival = ref<PlainDate | null>(null);
const form = ref<string>();
const onSubmit = (event: Event) => {
    event.preventDefault();
    form.value = formEntries(event.currentTarget as HTMLFormElement);
};
</script>

<template>
    <form class="flex flex-col items-start gap-4" @submit="onSubmit">
        <Picker.Root v-model:value="arrival" name="arrival" required locale="en-US">
            <DatePicker.Trigger><TextRuns :runs="['Arrival: ', iso(arrival) ?? 'none']" /></DatePicker.Trigger>
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
        <label class="flex flex-col gap-1 text-sm">Guest name<input name="guest" required /></label>
        <button type="submit">Submit</button>
    </form>
    <Output :values="{ form }" />
</template>
