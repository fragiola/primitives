<script setup lang="ts">
import { dateRangeField } from "examples-shared/recipes/date-field";
import { datePickerInput } from "examples-shared/recipes/date-picker";
import { CalendarButton, DateRangePickerInput } from "./date-picker-input.ts";

// A DateRangePickerInput's two ends and its Trigger (spec/calendar.md, "Typed input").
defineProps<{ start: string; end: string; trigger: string }>();
</script>

<template>
    <div :class="datePickerInput.group">
        <DateRangePickerInput.Segments range="start" :aria-label="start" />
        <span aria-hidden="true" :class="dateRangeField.separator">–</span>
        <DateRangePickerInput.Segments range="end" :aria-label="end" />
        <CalendarButton :aria-label="trigger"><span aria-hidden="true">▾</span></CalendarButton>
    </div>
</template>
