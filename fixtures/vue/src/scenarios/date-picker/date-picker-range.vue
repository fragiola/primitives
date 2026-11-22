<script setup lang="ts">
import {
    type DateRange,
    DateRangePicker as Primitive,
} from "@fragiola/primitives-vue/date-range-picker";
import { ref } from "vue";
import { isoRange } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { RangeCalendar } from "../../kit/ui/calendar.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import MonthView from "../../kit/ui/month-view.vue";

defineProps<{ locale: string }>();
const value = ref<DateRange | null>(null);
</script>

<template>
    <Primitive.Root v-model:value="value" :locale="locale">
        <DatePicker.Trigger><TextRuns :runs="['Choose dates: ', isoRange(value) ?? 'none']" /></DatePicker.Trigger>
        <DatePicker.Portal>
            <DatePicker.Positioner :side-offset="4">
                <DatePicker.Popup aria-label="Choose dates">
                    <RangeCalendar.Root>
                        <MonthView />
                    </RangeCalendar.Root>
                </DatePicker.Popup>
            </DatePicker.Positioner>
        </DatePicker.Portal>
    </Primitive.Root>
    <Output :values="{ value: isoRange(value) }" />
</template>
