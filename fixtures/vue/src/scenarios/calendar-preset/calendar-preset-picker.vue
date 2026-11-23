<script setup lang="ts">
import type {
    ChangeDetails,
    DateRange,
} from "@fragiola/primitives-vue/calendar";
import { ref } from "vue";
import { isoRange } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { RangeCalendar } from "../../kit/ui/calendar.ts";
import { CalendarPreset, PresetList } from "../../kit/ui/calendar-preset.ts";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import { DateRangePickerInput } from "../../kit/ui/date-picker-input.ts";
import { Field } from "../../kit/ui/field.ts";
import MonthView from "../../kit/ui/month-view.vue";
import TypedRange from "../../kit/ui/typed-range.vue";

// spec/calendar.md, `/calendar-preset/picker`
const THIS_WEEKEND: DateRange = {
    start: { year: 2026, month: 11, day: 21 },
    end: { year: 2026, month: 11, day: 22 },
};
const NEXT_WEEK: DateRange = {
    start: { year: 2026, month: 11, day: 23 },
    end: { year: 2026, month: 11, day: 29 },
};
const last = ref<{ value: string; reason: string }>();
const changes = ref(0);
const onValueChange = (value: DateRange | null, details: ChangeDetails) => {
    changes.value += 1;
    last.value = { value: isoRange(value) ?? "none", reason: details.reason };
};
</script>

<template>
    <Field.Root>
        <Field.Label>Stay</Field.Label>
        <DateRangePickerInput.Root locale="en-US" @value-change="onValueChange">
            <TypedRange start="Check-in" end="Check-out" trigger="Choose dates" />
            <DatePicker.Portal>
                <DatePicker.Positioner :side-offset="4">
                    <DatePicker.Popup aria-label="Choose dates">
                        <RangeCalendar.Root>
                            <MonthView />
                            <PresetList>
                                <CalendarPreset :value="THIS_WEEKEND">This weekend</CalendarPreset>
                                <CalendarPreset :value="NEXT_WEEK">Next week</CalendarPreset>
                            </PresetList>
                        </RangeCalendar.Root>
                    </DatePicker.Popup>
                </DatePicker.Positioner>
            </DatePicker.Portal>
        </DateRangePickerInput.Root>
    </Field.Root>
    <Output :values="{ value: last?.value, reason: last?.reason, changes }" />
</template>
