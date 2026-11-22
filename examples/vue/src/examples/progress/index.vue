<script setup lang="ts">
import { Progress } from "@fragiola/primitives-vue/progress";
import { ref } from "vue";
import { styles } from "./styles.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;
const value = ref<number | null>(25);
const add = () => {
    value.value = Math.min((value.value ?? 0) + 25, 100);
};

// Uploads and storage: an upload's progress written as a percentage, which "Add 25%" moves and
// "Unknown" makes indeterminate; a disk's use written in gigabytes (`format`, spec/progress.md).
</script>

<template>
    <div :class="styles.stack">
        <Progress.Root :value="value" :class="styles.root">
            <Progress.Label :class="styles.label">Upload</Progress.Label>
            <Progress.Value :class="styles.value" />
            <Progress.Track :class="styles.track"><Progress.Indicator :class="styles.indicator" /></Progress.Track>
        </Progress.Root>
        <div :class="styles.row">
            <button type="button" :class="styles.button" @click="add">Add 25%</button>
            <button type="button" :class="styles.button" @click="value = null">Unknown</button>
            <button type="button" :class="styles.button" @click="value = 0">Reset</button>
        </div>
        <Progress.Root :value="128" :max="512" :format="GIGABYTES" :class="styles.root">
            <Progress.Label :class="styles.label">Storage</Progress.Label>
            <Progress.Value :class="styles.value" />
            <Progress.Track :class="styles.track"><Progress.Indicator :class="styles.indicator" /></Progress.Track>
        </Progress.Root>
    </div>
</template>
