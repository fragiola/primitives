<script setup lang="ts">
import type { YearRange } from "@fragiola/primitives-vue/year-range-calendar";
import { ref } from "vue";
import { isoPeriod, isoYear } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { YearRangeCalendar } from "../../kit/ui/month-calendar.ts";
import PageView from "../../kit/ui/page-view.vue";

// spec/month-calendar.md, `/year-calendar/range`
const value = ref<YearRange | null>(null);
</script>

<template>
    <YearRangeCalendar.Root v-model:value="value" locale="en-US">
        <PageView prev="Previous years" next="Next years" />
    </YearRangeCalendar.Root>
    <Output :values="{ value: isoPeriod(value, isoYear) }" />
</template>
