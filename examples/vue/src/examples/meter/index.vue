<script setup lang="ts">
import { Meter } from "@fragiola/primitives-vue/meter";
import { styles } from "./styles.ts";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

// Storage and battery: a disk's use written in gigabytes (`format`), and a charge written as a
// percentage of the range, Meter's default (spec/meter.md).
</script>

<template>
    <div :class="styles.stack">
        <Meter.Root :value="384" :max="512" :format="GIGABYTES" :class="styles.root">
            <Meter.Label :class="styles.label">Storage</Meter.Label>
            <Meter.Value :class="styles.value" />
            <Meter.Track :class="styles.track"><Meter.Indicator :class="styles.indicator" /></Meter.Track>
        </Meter.Root>
        <Meter.Root :value="60" :class="styles.root">
            <Meter.Label :class="styles.label">Battery</Meter.Label>
            <Meter.Value :class="styles.value" />
            <Meter.Track :class="styles.track"><Meter.Indicator :class="styles.indicator" /></Meter.Track>
        </Meter.Root>
    </div>
</template>
