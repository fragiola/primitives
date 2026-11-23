<script setup lang="ts">
import { SegmentedControl } from "@fragiola/primitives-vue/segmented-control";
import { ref } from "vue";
import { styles } from "./styles.ts";

const VIEWS = [
    { value: "list", label: "List" },
    { value: "grid", label: "Grid" },
    { value: "board", label: "Board" },
];

const PROJECTS = ["Atlas", "Beacon", "Comet", "Drift", "Ember", "Flint"];

// A view switcher: one of three layouts for the same projects (spec/segmented-control.md). The
// control is one tab stop; every arrow moves the focus to the next view and checks it, and the
// Indicator, placed from its variables, slides under the checked segment. The app holds the view
// and lays the projects out by it.
const view = ref<string | null>("list");
</script>

<template>
    <div :class="styles.stack">
        <span id="view-label" :class="styles.label">View</span>
        <SegmentedControl.Root v-model:value="view" aria-labelledby="view-label" :class="styles.root">
            <SegmentedControl.Item v-for="entry in VIEWS" :key="entry.value" :value="entry.value" :class="styles.item">
                <SegmentedControl.ItemText :class="styles.itemText">{{ entry.label }}</SegmentedControl.ItemText>
            </SegmentedControl.Item>
            <SegmentedControl.Indicator :class="styles.indicator" />
        </SegmentedControl.Root>
        <ul aria-label="Projects" :data-view="view" :class="styles.projects">
            <li v-for="project in PROJECTS" :key="project" :class="styles.project">{{ project }}</li>
        </ul>
    </div>
</template>
