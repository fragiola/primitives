<script setup lang="ts">
import type { PlainYearMonth } from "@fragiola/primitives-vue/month-calendar";
import { ref } from "vue";
import { isoMonth } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { MonthCalendar } from "../../kit/ui/month-calendar.ts";
import PageView from "../../kit/ui/page-view.vue";

// spec/month-calendar.md, `/month-calendar/basic`
const MIN: PlainYearMonth = { year: 2025, month: 3 };
const MAX: PlainYearMonth = { year: 2027, month: 10 };
const isAugust2026 = (month: PlainYearMonth) =>
    month.year === 2026 && month.month === 8;
const value = ref<PlainYearMonth | null>(null);
</script>

<template>
    <MonthCalendar.Root v-model:value="value" :min="MIN" :max="MAX" :is-unavailable="isAugust2026" locale="en-US">
        <PageView prev="Previous year" next="Next year" />
    </MonthCalendar.Root>
    <Output :values="{ value: isoMonth(value) }" />
</template>
