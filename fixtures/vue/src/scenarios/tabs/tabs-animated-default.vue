<script setup lang="ts">
import type { ChangeDetails } from "@fragiola/primitives-vue/tabs";
import { tabs } from "examples-shared/recipes/tabs";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { TextRuns } from "../../kit/text-runs.ts";
import { Tabs } from "../../kit/ui/tabs.ts";

// spec/tabs.md, `/tabs/animated-default`: no `value` nor `defaultValue`, the first tab enters.
const TABS = [
    { value: "overview", label: "Overview" },
    { value: "projects", label: "Projects" },
    { value: "settings", label: "Settings" },
];
const value = ref<string>();
const reason = ref<string>();
const onValueChange = (next: string, details: ChangeDetails) => {
    value.value = next;
    reason.value = details.reason;
};
</script>

<template>
    <Tabs.Root @value-change="onValueChange">
        <Tabs.List>
            <Tabs.Tab v-for="tab in TABS" :key="tab.value" :value="tab.value">{{ tab.label }}</Tabs.Tab>
            <Tabs.Indicator />
        </Tabs.List>
        <div :class="tabs.panels">
            <Tabs.Panel v-for="tab in TABS" :key="tab.value" :value="tab.value" keep-mounted :class="tabs.motion">
                <p><TextRuns :runs="[tab.label, ' content']" /></p>
            </Tabs.Panel>
        </div>
    </Tabs.Root>
    <Output :values="{ value, reason }" />
</template>
