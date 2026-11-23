<script setup lang="ts">
import { CalendarView } from "@fragiola/primitives-vue/calendar-view";
import {
    MonthCalendar,
    type MonthCalendarItem,
} from "@fragiola/primitives-vue/month-calendar";
import { calendar, calendarView } from "examples-shared/recipes/calendar";
import { monthCalendar } from "examples-shared/recipes/month-calendar";

// The header (PrevButton, Heading, NextButton) and the grid of a month or year calendar, as every
// month and year scenario shows them (spec/month-calendar.md); `viewTrigger` puts the Heading
// inside a CalendarView Trigger ("Views").
withDefaults(
    defineProps<{ prev: string; next: string; viewTrigger?: boolean }>(),
    { viewTrigger: false },
);
const key = (item: MonthCalendarItem) =>
    "month" in item ? `${item.year}-${item.month}` : `${item.year}`;
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
            <MonthCalendar.PrevButton :class="calendar['prev-button']" :aria-label="prev">‹</MonthCalendar.PrevButton>
            <CalendarView.Trigger v-if="viewTrigger" :class="calendarView.trigger">
                <MonthCalendar.Heading :class="calendar.heading" as="span" />
            </CalendarView.Trigger>
            <MonthCalendar.Heading v-else :class="calendar.heading" />
            <MonthCalendar.NextButton :class="calendar['next-button']" :aria-label="next">›</MonthCalendar.NextButton>
        </div>
        <MonthCalendar.Grid :class="monthCalendar.grid">
            <MonthCalendar.GridBody v-slot="{ row }">
                <MonthCalendar.Row :key="key(row[0] as MonthCalendarItem)" :row="row" v-slot="{ item }">
                    <MonthCalendar.Cell :key="key(item)" :value="item" :class="monthCalendar.cell" />
                </MonthCalendar.Row>
            </MonthCalendar.GridBody>
        </MonthCalendar.Grid>
    </div>
</template>
