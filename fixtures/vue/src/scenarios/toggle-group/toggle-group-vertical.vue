<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/toggle-group";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Toggle } from "../../kit/ui/toggle.ts";
import { ToggleGroup } from "../../kit/ui/toggle-group.ts";

// spec/toggle-group.md, `/toggle-group/vertical`
const value = ref(["bold"]);
const changed = ref<string[]>();
const reason = ref<string>();
const onValue = (next: string[], details: ChangeDetails) => {
    value.value = next;
    changed.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <ToggleGroup
        aria-label="Text style"
        multiple
        orientation="vertical"
        :loop-focus="false"
        :value="value"
        @value-change="onValue"
    >
        <Toggle value="bold">Bold</Toggle>
        <Toggle value="italic">Italic</Toggle>
        <Toggle value="underline">Underline</Toggle>
    </ToggleGroup>
    <Output :values="{ value: changed?.join(','), reason }" />
</template>
