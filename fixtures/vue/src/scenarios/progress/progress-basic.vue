<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Progress } from "../../kit/ui/progress.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;
const value = ref<number | null>(40);
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <Progress.Root :value="value" locale="en-US">
            <Progress.Label>Upload</Progress.Label>
            <Progress.Value />
            <Progress.Track />
        </Progress.Root>
        <div class="flex gap-2">
            <button type="button" @click="value = 100">Complete</button>
            <button type="button" @click="value = null">Unknown</button>
        </div>
        <Progress.Root :value="128" :min="0" :max="512" :format="GIGABYTES" locale="en-US">
            <Progress.Label>Storage</Progress.Label>
            <Progress.Value />
            <Progress.Track />
        </Progress.Root>
    </div>
    <Output :values="{ value }" />
</template>
