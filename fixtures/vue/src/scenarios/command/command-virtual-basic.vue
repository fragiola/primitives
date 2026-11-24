<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Command, CommandVirtual } from "../../kit/ui/command.ts";
import { ITEMS } from "../virtual-lists/items.ts";

// spec/command.md, `/command-virtual/basic`: 10 000 Items, only those in view rendered.
interface Entry {
    value: string;
    disabled?: boolean | undefined;
}
const ENTRIES: readonly Entry[] = ITEMS.map((item) => ({
    value: item.label,
    disabled: item.disabled,
}));
const ran = ref<string>();
const run = (value: string) => {
    ran.value = value;
};
</script>

<template>
    <Command.Root>
        <Command.Input aria-label="Command" />
        <Command.Empty>No results.</Command.Empty>
        <CommandVirtual.List :items="ENTRIES" :item-size="36">
            <template #default="{ entry }: { entry: Entry }">
                <Command.Item :value="entry.value" :disabled="entry.disabled" @select="run">{{ entry.value }}</Command.Item>
            </template>
        </CommandVirtual.List>
    </Command.Root>
    <Output :values="{ ran }" />
</template>
