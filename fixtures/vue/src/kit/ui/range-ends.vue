<script setup lang="ts">
import { dateRangeField } from "examples-shared/recipes/date-field";
import { DateRangeField } from "./date-field.ts";

// The two ends side by side, an en dash between them (spec/date-range-field.md, "Scenarios").
defineProps<{ start: string; end: string }>();
</script>

<template>
    <div :class="dateRangeField.ends">
        <DateRangeField.Input range="start" :aria-label="start" />
        <span aria-hidden="true" :class="dateRangeField.separator">–</span>
        <DateRangeField.Input range="end" :aria-label="end" />
    </div>
</template>
