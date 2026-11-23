<script setup lang="ts">
import { datePickerInput } from "examples-shared/recipes/date-picker";
import { CalendarButton, DatePickerInput } from "./date-picker-input.ts";

// A DatePickerInput's segments and its Trigger (spec/calendar.md, "Typed input").
defineProps<{ trigger: string }>();
</script>

<template>
    <div :class="datePickerInput.group">
        <DatePickerInput.Segments />
        <CalendarButton :aria-label="trigger"><span aria-hidden="true">▾</span></CalendarButton>
    </div>
</template>
