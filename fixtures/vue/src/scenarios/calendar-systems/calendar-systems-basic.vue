<script setup lang="ts">
import { computed, ref } from "vue";
import { systemOf } from "../../kit/calendar-system.ts";
import { iso, isoMonth } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { Calendar } from "../../kit/ui/calendar.ts";
import { DateField } from "../../kit/ui/date-field.ts";
import { Field } from "../../kit/ui/field.ts";
import { MonthCalendar } from "../../kit/ui/month-calendar.ts";
import MonthView from "../../kit/ui/month-view.vue";
import PageView from "../../kit/ui/page-view.vue";

// spec/calendar-systems.md, `/calendar-systems/basic`
const props = defineProps<{ locale?: string }>();
const TODAY = { year: 2026, month: 11, day: 20 };
const calendar = computed(() => systemOf(props.locale));
const date = ref<string>();
const field = ref<string>();
const month = ref<string>();
type Item = { year: number; month?: number; day?: number } | null;
const onDate = (value: unknown) => {
    const next = value as Item;
    date.value =
        next !== null && !("start" in next)
            ? iso(next as { year: number; month: number; day: number })
            : undefined;
};
const onField = (value: unknown) => {
    field.value =
        value === null
            ? "none"
            : iso(value as { year: number; month: number; day: number });
};
const onMonth = (value: unknown) => {
    const next = value as Item;
    month.value =
        next !== null && !("start" in next)
            ? isoMonth(next as { year: number; month: number })
            : undefined;
};
</script>

<template>
    <div class="flex flex-wrap items-start gap-6">
        <Calendar.Root :calendar="calendar" :locale="locale" :default-value="TODAY" @value-change="onDate">
            <MonthView />
        </Calendar.Root>
        <div class="flex flex-col gap-4">
            <Field.Root>
                <Field.Label>Date</Field.Label>
                <DateField.Root :calendar="calendar" :locale="locale" :default-value="TODAY" @value-change="onField">
                    <DateField.Input v-slot="{ segment }">
                        <DateField.Segment :key="segment.index" :segment="segment" />
                    </DateField.Input>
                </DateField.Root>
            </Field.Root>
            <MonthCalendar.Root
                :calendar="calendar"
                :locale="locale"
                :default-value="calendar.yearMonthOf(TODAY)"
                @value-change="onMonth"
            >
                <PageView prev="Previous year" next="Next year" />
            </MonthCalendar.Root>
        </div>
    </div>
    <Output :values="{ date, field, month }" />
</template>
