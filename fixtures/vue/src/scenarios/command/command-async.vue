<script setup lang="ts">
import { useAsyncList } from "@fragiola/primitives-vue/async-list";
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Command } from "../../kit/ui/command.ts";
import { loadLabels } from "../virtual-lists/items.ts";

// spec/command.md, `/command/async`: the results load for the text, filtered by the loader.
const list = useAsyncList({ load: loadLabels });
const text = ref("");
const onText = (value: string) => {
    text.value = value;
    list.setFilterText(value);
};
</script>

<template>
    <Command.Root :filter="null" :loading="list.loading" :input-value="text" @input-value-change="onText">
        <Command.Input aria-label="Command" />
        <Command.Loading>Loading…</Command.Loading>
        <Command.Empty>No results.</Command.Empty>
        <Command.List>
            <Command.Item v-for="label in list.items" :key="label" :value="label">{{ label }}</Command.Item>
        </Command.List>
    </Command.Root>
    <Output :values="{ count: list.items.length, filter: list.loading ? undefined : list.filterText }" />
</template>
