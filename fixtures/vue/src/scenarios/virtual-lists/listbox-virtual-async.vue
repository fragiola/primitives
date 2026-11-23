<script setup lang="ts">
import { useAsyncList } from "@fragiola/primitives-vue/async-list";
import Output from "../../kit/output.vue";
import { Listbox } from "../../kit/ui/listbox.ts";
import { ListboxVirtual } from "../../kit/ui/virtual-lists.ts";
import { loadItems, type VirtualItem } from "./items.ts";

// A ListboxVirtual loading its pages as it scrolls (spec/virtual-lists.md).
const list = useAsyncList({ load: loadItems });
</script>

<template>
    <ListboxVirtual.Root aria-label="Items" :items="list.items" :loading="list.loading" @load-more="list.loadMore">
        <template #default="{ item }: { item: VirtualItem }">
            <Listbox.Item :value="item.value" :disabled="item.disabled">{{ item.label }}</Listbox.Item>
        </template>
    </ListboxVirtual.Root>
    <Output :values="{ count: list.items.length, status: list.status }" />
</template>
