<script setup lang="ts">
import { Switch } from "@fragiola/primitives-vue/switch";
import { styles } from "./styles.ts";

// Quick settings: three switches, each named by its label; Space and Enter toggle the focused one,
// "Airplane mode" is disabled (spec/switch.md).
</script>

<template>
    <div :class="styles.list">
        <div :class="styles.row">
            <Switch.Root id="wifi" default-checked :class="styles.root"><Switch.Thumb :class="styles.thumb" /></Switch.Root>
            <label for="wifi">Wi-Fi</label>
        </div>
        <div :class="styles.row">
            <Switch.Root id="bluetooth" :class="styles.root"><Switch.Thumb :class="styles.thumb" /></Switch.Root>
            <label for="bluetooth">Bluetooth</label>
        </div>
        <div :class="styles.row">
            <Switch.Root id="airplane" disabled :class="styles.root"><Switch.Thumb :class="styles.thumb" /></Switch.Root>
            <label for="airplane">Airplane mode</label>
        </div>
    </div>
</template>
