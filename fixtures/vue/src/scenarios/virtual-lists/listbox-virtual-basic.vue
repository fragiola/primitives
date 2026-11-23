<script setup lang="ts">
import { ref } from "vue";
import Output from "../../kit/output.vue";
import { Listbox } from "../../kit/ui/listbox.ts";
import { ListboxVirtual } from "../../kit/ui/virtual-lists.ts";
import { ITEMS, type VirtualItem } from "./items.ts";

// A multiple ListboxVirtual over the 10 000 items (spec/virtual-lists.md).
const value = ref<readonly string[]>([]);
const onValueChange = (next: string | null | string[]) => {
    value.value = next as string[];
};
</script>

<template>
    <ListboxVirtual.Root multiple aria-label="Items" :items="ITEMS" :value="value" @value-change="onValueChange">
        <template #default="{ item }: { item: VirtualItem }">
            <Listbox.Item :value="item.value" :disabled="item.disabled">{{ item.label }}</Listbox.Item>
        </template>
    </ListboxVirtual.Root>
    <Output :values="{ count: value.length, last: value.at(-1) }" />
</template>
