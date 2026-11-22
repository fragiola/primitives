<script setup lang="ts">
import { TextRuns } from "../../kit/text-runs.ts";
import { Tabs } from "../../kit/ui/tabs.ts";

// spec/tabs.md, `/tabs/none-selected`: every tab disabled, so no tab is selected.
const TABS = [
    { value: "account", label: "Account" },
    { value: "password", label: "Password" },
];
</script>

<template>
    <Tabs.Root>
        <Tabs.List>
            <Tabs.Tab v-for="tab in TABS" :key="tab.value" :value="tab.value" disabled>{{ tab.label }}</Tabs.Tab>
            <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel v-for="tab in TABS" :key="tab.value" :value="tab.value">
            <p><TextRuns :runs="[tab.label, ' settings']" /></p>
        </Tabs.Panel>
    </Tabs.Root>
</template>
