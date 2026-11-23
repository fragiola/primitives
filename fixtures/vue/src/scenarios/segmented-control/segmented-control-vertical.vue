<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { SegmentedControl } from "../../kit/ui/segmented-control.ts";
import Segments from "./segments.vue";
import { PERIODS } from "./views.ts";

// A vertical control that stops at its ends (spec/segmented-control.md, `/segmented-control/vertical`).
const value = ref<string | null>();
</script>

<template>
    <h2 id="period" class="text-sm font-semibold">Period</h2>
    <SegmentedControl.Root aria-labelledby="period" orientation="vertical" :loop-focus="false" default-value="day" @value-change="(next: string | null) => { value = next; }">
        <Segments :segments="PERIODS" />
        <SegmentedControl.Indicator />
    </SegmentedControl.Root>
    <Output :values="{ value }" />
</template>
