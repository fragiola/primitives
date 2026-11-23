<script setup lang="ts">
import type { YearMonthRange } from "@fragiola/primitives-vue/month-range-calendar";
import { ref } from "vue";
import { isoMonth, isoPeriod } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { MonthRangeCalendar } from "../../kit/ui/month-calendar.ts";
import PageView from "../../kit/ui/page-view.vue";

// spec/month-calendar.md, `/month-calendar/range`
const value = ref<YearMonthRange | null>(null);
</script>

<template>
    <MonthRangeCalendar.Root v-model:value="value" locale="en-US">
        <PageView prev="Previous year" next="Next year" />
    </MonthRangeCalendar.Root>
    <Output :values="{ value: isoPeriod(value, isoMonth) }" />
</template>
