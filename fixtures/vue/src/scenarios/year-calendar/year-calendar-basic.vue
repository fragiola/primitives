<script setup lang="ts">
import type { PlainYear } from "@fragiola/primitives-vue/year-calendar";
import { ref } from "vue";
import { isoYear } from "../../kit/iso.ts";
import Output from "../../kit/output.vue";
import { YearCalendar } from "../../kit/ui/month-calendar.ts";
import PageView from "../../kit/ui/page-view.vue";

// spec/month-calendar.md, `/year-calendar/basic`
const MIN: PlainYear = { year: 2010 };
const MAX: PlainYear = { year: 2035 };
const value = ref<PlainYear | null>(null);
</script>

<template>
    <YearCalendar.Root v-model:value="value" :min="MIN" :max="MAX" locale="en-US">
        <PageView prev="Previous years" next="Next years" />
    </YearCalendar.Root>
    <Output :values="{ value: isoYear(value) }" />
</template>
