<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/toggle-group";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Toggle } from "../../kit/ui/toggle.ts";
import { ToggleGroup } from "../../kit/ui/toggle-group.ts";

// spec/toggle-group.md, `/toggle-group/basic` (and `?dir=rtl`)
const value = ref<string[]>();
const reason = ref<string>();
const onValue = (next: string[], details: ChangeDetails) => {
    value.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <button type="button">Before</button>
        <ToggleGroup aria-label="Alignment" :default-value="['left']" @value-change="onValue">
            <Toggle value="left">Left</Toggle>
            <Toggle value="center">Center</Toggle>
            <Toggle value="right">Right</Toggle>
            <Toggle value="justify" disabled>Justify</Toggle>
        </ToggleGroup>
        <button type="button">After</button>
    </div>
    <Output :values="{ value: value?.join(','), reason }" />
</template>
