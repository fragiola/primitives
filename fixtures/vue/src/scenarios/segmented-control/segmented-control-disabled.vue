<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { SegmentedControl } from "../../kit/ui/segmented-control.ts";
import Segments from "./segments.vue";
import { VIEWS } from "./views.ts";

// A disabled control (spec/segmented-control.md, `/segmented-control/disabled`).
const ENABLED = VIEWS.filter((view) => view.value !== "board").map(
    ({ value, label }) => ({ value, label }),
);
const value = ref<string | null>();
</script>

<template>
    <h2 id="view" class="text-sm font-semibold">View</h2>
    <SegmentedControl.Root aria-labelledby="view" disabled default-value="grid" @value-change="(next: string | null) => { value = next; }">
        <Segments :segments="ENABLED" />
        <SegmentedControl.Indicator />
    </SegmentedControl.Root>
    <button type="button" class="mt-2">After</button>
    <Output :values="{ value }" />
</template>
