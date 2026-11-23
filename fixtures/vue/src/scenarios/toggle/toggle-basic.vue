<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/toggle";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Toggle } from "../../kit/ui/toggle.ts";

// spec/toggle.md, `/toggle/basic`
const last = ref<{ toggle: string; pressed: boolean; reason: string }>();
const report =
    (toggle: string) => (pressed: boolean, details: ChangeDetails) => {
        last.value = { toggle, pressed, reason: details.reason };
    };
const on = {
    Bold: report("Bold"),
    Italic: report("Italic"),
    Underline: report("Underline"),
    Strike: report("Strike"),
};
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <Toggle @pressed-change="on.Bold">Bold</Toggle>
        <Toggle default-pressed @pressed-change="on.Italic">Italic</Toggle>
        <Toggle disabled @pressed-change="on.Underline">Underline</Toggle>
        <Toggle :native-button="false" as="span" @pressed-change="on.Strike">Strike</Toggle>
    </div>
    <Output :values="{ toggle: last?.toggle, pressed: last?.pressed, reason: last?.reason }" />
</template>
