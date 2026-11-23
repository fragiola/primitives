<script setup lang="ts">
import { CalendarView } from "@fragiola/primitives-vue/calendar-view";
import { MonthCalendar, YearCalendar } from "./month-calendar.ts";
import MonthView from "./month-view.vue";
import PageView from "./page-view.vue";

// A calendar's three views (spec/month-calendar.md, "Views"): the days with their header's
// Heading in the view Trigger (and an optional footer slot), the months, the years.
</script>

<template>
    <CalendarView.Root v-slot="{ view }">
        <template v-if="view === 'day'">
            <MonthView view-trigger />
            <slot name="footer" />
        </template>
        <MonthCalendar.Root v-else-if="view === 'month'">
            <PageView prev="Previous year" next="Next year" view-trigger />
        </MonthCalendar.Root>
        <YearCalendar.Root v-else>
            <PageView prev="Previous years" next="Next years" view-trigger />
        </YearCalendar.Root>
    </CalendarView.Root>
</template>
