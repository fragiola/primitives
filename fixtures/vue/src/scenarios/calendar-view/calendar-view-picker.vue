<script setup lang="ts">
import {
    type ChangeDetails,
    type PlainDate,
    DatePicker as Primitive,
} from "@fragiola/primitives-vue/date-picker";
import { ref } from "vue";
import { iso } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { Calendar } from "../../kit/ui/calendar.ts";
import { CalendarPreset, PresetList } from "../../kit/ui/calendar-preset.ts";
import CalendarViews from "../../kit/ui/calendar-views.vue";
import { DatePicker } from "../../kit/ui/date-picker.ts";
import { todayPreset } from "../calendar-preset/presets.ts";

// spec/month-calendar.md, `/calendar-view/picker`
const MIN: PlainDate = { year: 2025, month: 6, day: 15 };
const MAX: PlainDate = { year: 2028, month: 2, day: 10 };
const value = ref<PlainDate | null>(null);
const reason = ref<string>();
</script>

<template>
    <Primitive.Root
        v-model:value="value"
        :min="MIN"
        :max="MAX"
        locale="en-US"
        @open-change="(_: boolean, details: ChangeDetails) => (reason = details.reason)"
    >
        <DatePicker.Trigger><TextRuns :runs="['Choose date: ', iso(value) ?? 'none']" /></DatePicker.Trigger>
        <DatePicker.Portal>
            <DatePicker.Positioner :side-offset="4">
                <DatePicker.Popup aria-label="Choose date">
                    <Calendar.Root>
                        <CalendarViews>
                            <template #footer>
                                <PresetList>
                                    <CalendarPreset :value="todayPreset">Today</CalendarPreset>
                                </PresetList>
                            </template>
                        </CalendarViews>
                    </Calendar.Root>
                </DatePicker.Popup>
            </DatePicker.Positioner>
        </DatePicker.Portal>
    </Primitive.Root>
    <Output :values="{ value: iso(value), reason }" />
</template>
