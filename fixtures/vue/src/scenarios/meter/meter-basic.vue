<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Meter } from "../../kit/ui/meter.ts";

// spec/meter.md, `/meter/basic` (and `?dir=rtl`)
const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;
const value = ref(60);
</script>

<template>
    <div class="flex flex-col items-start gap-4">
        <Meter.Root :value="value" locale="en-US">
            <Meter.Label>Battery</Meter.Label>
            <Meter.Value />
            <Meter.Track />
        </Meter.Root>
        <div class="flex gap-2">
            <button type="button" @click="value = 10">Drain</button>
            <button type="button" @click="value = 140">Overcharge</button>
        </div>
        <Meter.Root :value="384" :max="512" :format="GIGABYTES" locale="en-US">
            <Meter.Label>Storage</Meter.Label>
            <Meter.Value />
            <Meter.Track />
        </Meter.Root>
    </div>
    <Output :values="{ value }" />
</template>
