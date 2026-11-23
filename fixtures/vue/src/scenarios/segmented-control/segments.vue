<script setup lang="ts">
import { SegmentedControl } from "../../kit/ui/segmented-control.ts";
import type { Segment } from "./views.ts";

// The Items of a scenario.
defineProps<{ segments: readonly Segment[] }>();
</script>

<template>
    <SegmentedControl.Item v-for="segment in segments" :key="segment.value" :value="segment.value" :disabled="segment.disabled">{{ segment.label }}</SegmentedControl.Item>
</template>
